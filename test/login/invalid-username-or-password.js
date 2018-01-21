const assert = require('assert')
const { get, post } = require('../utils/fetch')
const httpStatus = require('http-status')
const server = require('../setup/server')
const { port } = require('../setup/app.dev.config')
global.config = require('../setup/app.dev.config')
const {  Users, ActionVerifications } = require('../../src/entities')
const baseUrl = `http://localhost:${port}/user`
const uuid = require('uuid')

const credentials = {
  username: `${uuid.v4()}@any-domain.com`,
  password: `${uuid.v4()}`
}

describe('Login', () =>  {
  
  server()

  describe('Invalid username or password', () => {
    it('should return \'Invlid username or password\' when invalid credentials', function(done) {
      this.timeout(10000)
      post(`${baseUrl}/sign-in`, credentials )
        .then(({ message }) => {
          assert.equal('Invlid username or password', message)
          done()
        })
    })
  })

  describe('Sign up user', () => {
    it('should return \'User create, email verification sent\'', function(done) {
      this.timeout(10000)
      post(`${baseUrl}/sign-up`, credentials )
        .then(({ message }) => {
          assert.equal('User create, email verification sent', message)
          done()
        })
    })
  })

  describe('Sign up user that already exist', () => {
    it('should return \'Username already exist in system\'', function(done) {
      this.timeout(10000)
      post(`${baseUrl}/sign-up`, credentials )
        .then(({ message }) => {
          assert.equal('Username already exist in system', message)
          done()
        })
    })
  })

  describe('Sign in user', () => {
    it('should return token', function(done) {
        this.timeout(10000)
        const { username } = credentials
        Users
          .findOne({
            where: {
              username
            }
          })
          .then((user) => {
            return user.update({ isValid: true }, { where: { username }})
          })
          .then((user) => {

            post(`${baseUrl}/sign-in`, credentials )
            .then(({ token }) => {
              assert.notEqual(token, undefined, 'Got valid token')
              done()
            })
          })
         })
  })
})