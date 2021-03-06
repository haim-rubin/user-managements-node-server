import httpStatus from 'http-status'
import { credentials, baseUrl, changePasswordRoute } from '../data'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { ACTION_VERIFICATIONS, VERBAL_CODE } from '../../src/consts'
import { extract } from '../../src/utils/SequelizeHelper'
import { getDbConfigWithForgotPasswordAction } from './helper'

describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  let ActionVerifications
  before(done => {
    getDbConfigWithForgotPasswordAction()
      .then(({ server: srv, entities })=>{
        server = srv
        ActionVerifications = entities.ActionVerifications
      })
      .then(() => done())
  })


  describe('Verify change password rejected when confirmPassword not equal to password', () => {
    it(`Should return '${httpStatus[httpStatus.BAD_REQUEST]}' with message '${VERBAL_CODE.CONFIRM_PASSWORD_NOT_EQUAL_TO_PASSWORD}'`,
      done => {
        ActionVerifications
          .findOne({
            where: {
              username: credentials.username,
              actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD,
              deleted: false
            }
          })
          .then(extract)
          .then(( { actionId } ) => {
            request
              .post(`${changePasswordRoute}/${actionId}`)
              .send({ password: '12345678', confirmPassword: '98887776' })
              .end((err, res) => {
                const { body } = res
                expect(res)
                  .to.have.status(httpStatus.BAD_REQUEST)

                expect(body.message)
                  .to.equal(VERBAL_CODE.CONFIRM_PASSWORD_NOT_EQUAL_TO_PASSWORD)

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