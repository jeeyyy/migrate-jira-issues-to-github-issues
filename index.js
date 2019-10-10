const config = require('./config')
const Octokit = require('@octokit/rest')
const octokit = new Octokit({ auth: config.github.token })
const getFileContents = require('./get-file-contents')
const csvStringToArray = require('./csv-string-to-array')
const getJiraAttachments = require('./get-jira-attachments')

/**
 * Invoke
 */
init()
  .catch(e => {
    console.error(e)
    process.write(1)
  })
  .finally(() => console.info('Completed'))

/**
 * Init
 */
async function init() {
  const csvContents = await getFileContents(config.file)
  const csvData = csvStringToArray(csvContents)
  if (!csvData) {
    throw new Error(`No data to parse from given CSV`)
  }

  console.info(`Processing - Total issues read from CSV: ${csvData.length}`);
  await processData(csvData)
}

/**
 * Process data
 * @param {Array<Object>} data parsed csv data
 */
async function processData(data) {
  /**
   * Github API rejects multiple consecutive requests overtime, so adding a buffer
   */
  const BUFFER = 1000
  return Promise.all(
    data.map(async (issue) =>
      setTimeout(async () => await createIssue(issue), BUFFER)
    )
  )
}

async function createIssue(issue) {
  const {
    'Summary': title,
    'Issue key': jiraKey,
    'Assignee': assignee,
    'Description': body,
    'Attachment': attachment
  } = issue

  if (!jiraKey) {
    return
  }

  /**
   * Note:
   * Fetching attachments is experimental in that JIRA allows for uploading MP4,
   * which is not supported in GITHUB.
   * 
   * The `getJiraAttachments` fn, downloads MP4 from JIRA and converts them into `GIF`
   * and saves them in `attachments` directory with `jiraKey` as the directory.
   * 
   * These can optionally be uploaded as a comment, but I did not attempt this given 
   * again GITHUB only allows 10MB attachments
   */
  // let attachmentFiles = await getJiraAttachments(attachment, jiraKey)
  // console.info(`Attachments for ${jiraKey}:`, attachmentFiles);

  /**
   * get issue assignee
   */
  const assignTo = getIssueAssignee(assignee)
  /**
   * create issue
   */
  const { data: issueData } = await octokit.issues.create({
    owner: config.github.owner,
    repo: config.github.repo,
    title: `${title} [${jiraKey}]`,
    body,
    ...assignTo
  })

  /**
   * Create a comment on the new GitHub issue
   * - with a 
   */
  const { number: issueNumber } = issueData;
  if (!issueNumber) {
    return
  }
  await octokit.issues
    .createComment({
      owner: config.github.owner,
      repo: config.github.repo,
      number: issueNumber,
      body: `This issue was ported from https://dequesrc.atlassian.net/browse/${jiraKey}`
    })
  console.info(`Created issue and added comment.`)
}


function getIssueAssignee(jiraAssignee) {
  if (!jiraAssignee) {
    return
  }

  if (Array.isArray(jiraAssignee)) {
    return {
      assignees: jiraAssignee.map((user) => config.jiraGithubUsers[user.toLowerCase()])
    }
  }

  return {
    assignee: config.jiraGithubUsers[jiraAssignee.toLowerCase()]
  }
}