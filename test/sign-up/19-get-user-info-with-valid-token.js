import httpStatus from 'http-status'
import { credentials, signInRoute, userInfo, baseUrl, TOKEN_KEY } from '../data'
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

  describe(`Get user info with valid token`, () => {
    it(`Should return ${httpStatus[httpStatus.OK]} and username`,
      done => {
        request
          .post(signInRoute)
          .send({ ...credentials, password: '00000000' })
          .end((err, res) => {
            const { body } = res
            expect(res).to.have.status(httpStatus.OK)
            const { [TOKEN_KEY]: token } = body
            request
              .get(userInfo)
              .set('token', token)
              .end((err, res) => {
                const { body } = res
                expect(res).to.have.status(httpStatus.OK)
                expect(body.username).to.equal(credentials.username)
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