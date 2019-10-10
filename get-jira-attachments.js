const config = require('./config')
const fs = require('fs')
const path = require('path')
const gify = require('gify')
const axios = require('axios')
const { promisify } = require('util');
const makeDir = require('make-dir');
const writeFile = promisify(fs.writeFile);
const refineAttachmentData = require('./refine-attachment-data')
const createFile = (file, content) =>
  makeDir(path.dirname(file)).then(() => writeFile(file, content));

const getAttachment = async (attachmentUrl, jiraKey) => {
  const fileName = attachmentUrl.split('/').pop()
  const output = path.resolve(__dirname, 'attachments', jiraKey, fileName)
  await createFile(output, '')
  const writer = fs.createWriteStream(output)

  const response = await axios({
    method: 'get',
    url: attachmentUrl,
    auth: config.jira.auth,
    responseType: 'stream'
  })
  response.data.pipe(writer)
  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      if (fileName.includes('.mp4')) {
        const gifName = output.replace('.mp4', '.gif')
        const gifOptions = {
          rate: 5,
          width: 400
        }
        gify(output, gifName, gifOptions, (err) => {
          if (err) {
            reject(err)
          }
          resolve(gifName)
        });
      } else {
        resolve(output)
      }
    })
    writer.on('error', reject)
  })
}

const getJiraAttachments = async (csvAttachment, jiraKey) => {
  if (!csvAttachment) {
    return []
  }

  const attachments = Array.isArray(csvAttachment)
    ? csvAttachment.filter(a => a.length).map(refineAttachmentData)
    : [refineAttachmentData(csvAttachment)]

  return Promise.all(
    attachments.map(async attachment => {
      return await getAttachment(attachment, jiraKey)
    })
  )
}

module.exports = getJiraAttachments