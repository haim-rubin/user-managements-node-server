import httpStatus from 'http-status'
import { userInfo, baseUrl } from '../data'
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

  describe(`Get user info without token`, () => {
    it(`Should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      done => {
        request
          .get(userInfo)
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