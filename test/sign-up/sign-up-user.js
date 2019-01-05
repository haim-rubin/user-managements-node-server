import assert from 'assert'
import expect from 'expect.js'
import { get, post } from '../utils/fetch'
import httpStatus from 'http-status'
const baseUrl = 'http://localhost:5000/user'

const credentials = {
  username: 'haim.rubin@gmail.com',
  password: '123456'
}

describe('Sign-up user', () =>  {
  describe('Verify create user', () => {
    it(`should return ${httpStatus[httpStatus.CREATED]}`, function(done) {
      this.timeout(10000)
      post(`${baseUrl}/sign-up`, credentials )
        .then(({ message }) => {
          expect(message).to.equal(httpStatus[httpStatus.CREATED])
          done()
        })
    })
  })

  describe('Verify getting error when create user which is exist', () => {
    it(`should return ${httpStatus[httpStatus.CONFLICT]}`, function(done) {
      this.timeout(10000)
      post(`${baseUrl}/sign-up`, credentials )
        .then(({ message }) => {
          expect(message).to.equal(httpStatus[httpStatus.CONFLICT])
          done()
        })
    })
  })
})