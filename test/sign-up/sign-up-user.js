import httpStatus from 'http-status'
import { validatePostResponse, validateGetResponse } from '../utils/validateMessageStatus'
import { credentials, signUpUrl, verifyUrl } from '../data'

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

  describe('Verify user by activation link', () => {
    it(`should return ${httpStatus[httpStatus.OK]}`,
      validateGetResponse(
        verifyUrl,
        httpStatus.OK
      )
    )
  })
})