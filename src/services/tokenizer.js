const jwt = require('jsonwebtoken')

const getToken = id => (
  Promise
    .resolve({ token: jwt.sign(id, global.config.tokenHash) })
)

module.exports = {
  getToken
}