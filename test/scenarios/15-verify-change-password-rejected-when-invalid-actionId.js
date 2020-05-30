import httpStatus from 'http-status'
import { baseUrl, changePasswordRoute } from '../data'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import uuid from 'uuid'
import { getDbConfigWithForgotPasswordAction } from './helper'

describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  before(done => {
    getDbConfigWithForgotPasswordAction()
      .then(({ server: srv })=>{
        server = srv
      })
      .then(() => done())
  })

  describe('Verify change password rejected when invalid actionId', () => {
    it(`Should return '${httpStatus[httpStatus.FORBIDDEN]}' with message '${httpStatus[httpStatus.FORBIDDEN]}'`,
      done => {
        Promise
          .resolve({ actionId: uuid.v4()})
          .then(( { actionId } ) => {
            request
              .post(`${changePasswordRoute}/${actionId}`)
              .send({ password: '12345678', confirmPassword: '12345678' })
              .end((err, res) => {
                const { body } = res
                expect(res)
                  .to.have.status(httpStatus.FORBIDDEN)

                expect(body.message)
                  .to.equal(httpStatus[httpStatus.FORBIDDEN])

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