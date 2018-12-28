import validator from 'validator'
import httpStatus from 'http-status'
import ExtError from '../utils/ExtError'
const UuidVersion = 4

export const isValidUsername = (email) => (
  email && 
  validator.isLength(email, { min: 3 }) &&  
  validator.isEmail(email)
)

export const isValidPassword = (password) => (
  password && 
  validator.isLength(password, { min: 3 }) && 
  password.indexOf(' ') === -1
)

export const isValidUsernameAndPassword = ({ username, password }, error) => (
  new Promise((resolve, reject) => {
    isValidPassword(password) && isValidUsername(username) ?
      resolve(true) :
      reject(error)
  })
)

export const isValidActionId = ({ actionId }) => (
  new Promise((resolve, reject) => {
    validator.isUUID(actionId, UuidVersion) ?
      resolve(true) :
      reject(new ExtError(httpStatus[httpStatus.BAD_REQUEST],httpStatus.BAD_REQUEST))
  })
)