const isUrl = require('is-url')

const refineAttachmentData = (item) => {
  if(!item) {
    return undefined
  }
  const url = item.split(';').filter(s => isUrl(s))
  if (url) {
    return url[0]
  }
  return undefined
}

module.exports = refineAttachmentData