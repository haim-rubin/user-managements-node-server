import httpStatus from 'http-status'
import { validatePostResponse, validateGetResponseStatus } from '../utils/validateMessageStatus'
import { credentials, signUpUrl, verifyUrl, signInUrl } from '../data'
import config from '../setup/app.dev.config.json'
import initEntities from '../../src/entities'
import { extract } from '../../src/utils/SequelizeHelper'
const logger = {
  log: () => {},
  info: () => {},
  error: () => {}
}
const { Users, ActionVerifications } = initEntities({ config: config.database, logger })

describe('Sign-up user', () =>  {
  describe('Verify create user', () => {
    it(`should return ${httpStatus[httpStatus.CREATED]}`,
      validatePostResponse(
        signUpUrl,
        credentials,
        httpStatus.CREATED, {
          message: httpStatus[httpStatus.CREATED]
        }
      )
    )
  })

  describe('Verify getting error when create user which is exist', () => {
    it(`should return ${httpStatus[httpStatus.CONFLICT]}`,
      validatePostResponse(
        signUpUrl,
        credentials,
        httpStatus.CONFLICT, {
          message: httpStatus[httpStatus.CONFLICT]
        }
      )
    )
  })

  describe(`Sign in with valid credential before activated(verifiy)`, () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      validatePostResponse(
        signInUrl,
        credentials,
        httpStatus.UNAUTHORIZED,{
          message: httpStatus[httpStatus.UNAUTHORIZED]
        }
      )
    )
  })

  describe('Verify user by activation link', () => {
    it(`should return ${httpStatus[httpStatus.OK]}`, (done) =>{
      const context = this

      ActionVerifications
        .findOne({ where: { username: credentials.username }})
        .then(extract)
        .then(({ actionId }) => {
          return validateGetResponseStatus(
            `${verifyUrl}/${actionId}`,
            httpStatus.OK
          ).bind(context)(done)
        })
    })
  })

  describe(`Sign in with valid credential after activated(verifiy)`, () => {
    it(`should return ${httpStatus[httpStatus.OK]}`,
      validatePostResponse(
        signInUrl,
        credentials,
        httpStatus.OK
      )
    )
  })

  describe('Verify activation link obsolete', () => {
    it(`should return ${httpStatus[httpStatus.FORBIDDEN]}`, (done) =>{
      const context = this

      ActionVerifications
        .findOne({ where: { username: credentials.username }})
        .then(extract)
        .then(({ actionId }) => {
          return validateGetResponseStatus(
            `${verifyUrl}/${actionId}`,
            httpStatus.FORBIDDEN
          ).bind(context)(done)
        })
    })
  })
})