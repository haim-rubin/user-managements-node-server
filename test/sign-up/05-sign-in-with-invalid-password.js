import httpStatus from 'http-status'
import { credentials, baseUrl, signInRoute } from '../data'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { getDbConfigWithInactivrUser } from './helper'
describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  before(done => {
    getDbConfigWithInactivrUser()
      .then(({ server: srv })=>{
        server = srv
      })
      .then(() => done())
  })

  describe(`Sign in with invalid password`, () => {
      it(`Should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
        done => {
          request
            .post(signInRoute)
            .send({ ...credentials, password: 'no-' + credentials.password })
            .end((err, res) => {
              const { body } = res
              expect(res).to.have.status(httpStatus.UNAUTHORIZED)
              expect(body.message)
                .to.equal(httpStatus[ httpStatus.UNAUTHORIZED ])

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