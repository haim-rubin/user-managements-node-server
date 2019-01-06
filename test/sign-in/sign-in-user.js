import httpStatus from 'http-status'
import { validatePostResponse } from '../utils/validateMessageStatus'
import { credentials, signInUrl } from '../data'

describe('Sign-in', () =>  {
  describe(`sign in with invalid password`, () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      validatePostResponse(
          signInUrl,
          credentials,
          httpStatus.UNAUTHORIZED, {
            message: httpStatus[httpStatus.UNAUTHORIZED]
          }
      )
    )
  })

  describe(`sign in with invalid username`, () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      validatePostResponse(
        signInUrl,
        credentials,
        httpStatus.UNAUTHORIZED, {
          message: httpStatus[httpStatus.UNAUTHORIZED]
        }
      )
    )
  })


  // describe('Sign up user', () => {
  //   xit('should return \'User create, email verification sent\'', function(done) {
  //     this.timeout(10000)
  //     post(`${baseUrl}/sign-up`, credentials )
  //       .then(({ message }) => {
  //         assert.equal('User create, email verification sent', message)
  //         done()
  //       })
  //   })
  // })

  // describe('Sign up user that already exist', () => {
  //   xit('should return \'Username already exist in system\'', function(done) {
  //     this.timeout(10000)
  //     post(`${baseUrl}/sign-up`, credentials )
  //       .then(({ message }) => {
  //         assert.equal('Username already exist in system', message)
  //         done()
  //       })
  //   })
  // })

  // describe('Sign in user', () => {
  //   it('should return token', function(done) {
  //       this.timeout(10000)
  //       const { username } = credentials
  //       Users
  //         .findOne({
  //           where: {
  //             username
  //           }
  //         })
  //         .then((user) => {
  //           return user.update({ isValid: true }, { where: { username }})
  //         })
  //         .then((user) => {

  //           post(`${baseUrl}/sign-in`, credentials )
  //           .then(({ token }) => {
  //             assert.notEqual(token, undefined, 'Got valid token')
  //             done()
  //           })
  //         })
  //        })
  // })
})