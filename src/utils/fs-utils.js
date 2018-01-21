const fs = require('fs')

const readFile = (fileName) => (
  new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (error, content) => {
      err ? reject(error) : resolve(content)
    })
  })
)

module.exports = { readFile }