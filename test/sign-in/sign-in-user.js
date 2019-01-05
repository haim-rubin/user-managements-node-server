import assert from 'assert'
import expect from 'expect.js'
import { get, post } from '../utils/fetch'
import httpStatus from 'http-status'
const baseUrl = 'http://localhost:5000/user'

const credentials = {
  username: 'haim.rubin1@gmail.com',
  password: '00000'
}

describe('Sign-in', () =>  {
  describe(`sign in with invalid password`, () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`, function(done) {
      this.timeout(10000)
      post(`${baseUrl}/sign-in`, credentials )
        .then(({ message }) => {
          expect(message).to.equal(httpStatus[httpStatus.UNAUTHORIZED])
          done()
        })
    })
  })

  describe(`sign in with invalid username`, () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`, function(done) {
      this.timeout(10000)
      post(`${baseUrl}/sign-in`, credentials )
        .then(({ message }) => {
          expect(message).to.equal(httpStatus[httpStatus.UNAUTHORIZED])
          done()
        })
    })
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