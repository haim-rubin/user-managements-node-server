import httpStatus from 'http-status'
import { credentials, baseUrl, signInRoute, signOutRoute, TOKEN_KEY } from '../data'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { getDbConfigWithActivatedUser } from './helper'

describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  before(done => {
    getDbConfigWithActivatedUser()
      .then(({ server: srv })=>{
        server = srv
      })
      .then(() => done())
  })

  describe('Verify logout succeded when logout with valid token', () => {
    it(`Should return ${httpStatus[httpStatus.OK]}`,
      done => {
        request
          .post(signInRoute)
          .send(credentials)
          .end((err, res) => {
            const { body } = res
            expect(res).to.have.status(httpStatus.OK)
            const { [TOKEN_KEY]: token } = body

            request
              .post(signOutRoute)
              .set(TOKEN_KEY, token)
              .send(credentials)
              .end((err, res) => {
                expect(res).to.have.status(httpStatus.OK)
                done()

              })
          })
      }
    )
  })

  after(done => {
    server.stop()
    done()
  })
})