import httpStatus from 'http-status'
import { validatePostResponse } from '../utils/validateMessageStatus'
import { credentials, signUpUrl } from '../data'

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
})