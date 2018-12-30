import validator from 'validator'
import httpStatus from 'http-status'
import HttpError from "./HttpError";
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

const getValidation = (username, password) => ({
    isValidPassword: isValidPassword(password),
    isValidUsername: isValidUsername(username),
    get isValid(){
      return (
        this.isValidPassword
        && this.isValidUsername
      ) 
    }
  })

export const isValidUsernameAndPassword = ({ username, password }) => (
  new Promise((resolve, reject) => {
    const credential = getValidation(username, password)
    credential.isValid
    ? resolve(true)
    : reject(credential)
  })
)

export const isValidActionId = ({ actionId }) => (
  new Promise((resolve, reject) => {
    validator.isUUID(actionId, UuidVersion) ?
      resolve(true) :
      reject(new HttpError(httpStatus[httpStatus.BAD_REQUEST],httpStatus.BAD_REQUEST))
  })
)