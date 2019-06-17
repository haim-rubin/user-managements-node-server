import httpStatus from 'http-status'
import { credentials, baseUrl, signOutRoute } from '../data'
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

  describe('Verify logout fail when logout without token', () => {
    it(`Should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      done => {
        request
          .post(signOutRoute)
          .send(credentials)
          .end((err, res) => {
            expect(res).to.have.status(httpStatus.UNAUTHORIZED)

            done()
          })
      }
    )
  })

  after(done => {
    server.stop()
    done()
  })
})