const fs = require('fs')

/**
 * Promisified file read fn
 * @param {path} file path to file
 */
const getFileContents = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        reject(err)
      }
      resolve(data)
    });
  })
}

module.exports = getFileContents