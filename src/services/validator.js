const validator = require('validator')
const { MESSAGES } = require('../consts')
const httpStatus = require('http-status')
const ExtError = require('../utils/ExtError')

const isValidUsername = (email) => (
  email && 
  validator.isLength(email, { min: 3 }) &&  
  validator.isEmail(email)
)

const isValidPassword = (password) => (
  password && 
  validator.isLength(password, { min: 3 }) && 
  password.indexOf(' ') === -1
)

const isValidUsernameAndPassword = ({ username, password }, error) => (
  new Promise((resolve, reject) => {
    isValidPassword(password) && isValidUsername(username) ?
      resolve(true) :
      reject(error)
  })
)
const UuidVersion = 4
const isValidActionId = ({ actionId }) => (
  new Promise((resolve, reject) => {
    validator.isUUID(actionId, UuidVersion) ?
      resolve(true) :
      reject(new Error(httpStatus.BAD_REQUEST))
  })
)


module.exports = {
  isValidUsername,
  isValidPassword,
  isValidUsernameAndPassword,
  isValidActionId
}
