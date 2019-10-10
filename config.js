const config = {
  file: './issues/myIssues.csv',
  jira: {
    auth: {
      username: '__JIRA_EMAIL_ID__',
      password: '__JIRA_TOKEN__'
    }
  },
  github: {
    owner: '__GITHUB_OWNER__',
    repo: '__GITHUB_REPO__',
    token: '__GITHUB_PERSONAL_ACCESS_TOKEN__'
  },
  jiraGithubUsers: {
    'usernameInJira': 'usernameInGitHub',
  }
}

module.exports = config