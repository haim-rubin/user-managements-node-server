import httpStatus from 'http-status'
import { credentials, baseUrl, forgotPasswordRoute } from '../data'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { ACTION_VERIFICATIONS, VERBAL_CODE } from '../../src/consts'
import { extract } from '../../src/utils/SequelizeHelper'
import { getDbConfigWithVerifiedUser } from './helper'

describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  let ActionVerifications
  before(done => {
    getDbConfigWithVerifiedUser()
      .then(({ server: srv, entities })=>{
        server = srv
        ActionVerifications = entities.ActionVerifications
      })
      .then(() => done())
  })

  describe('Verify when posting forgot-password action verification created', () => {
    it(`Should return ${httpStatus[httpStatus.OK]}`,
      done => {
        const { username } = credentials
        request
          .post(forgotPasswordRoute)
          .send({ username })
          .end((err, res) => {
            const { body } = res
            expect(res).to.have.status(httpStatus.OK)
            const message = body.message
            expect(message)
              .to.equal(
                VERBAL_CODE.RESTORE_PASSWORD_LINK_SENT_TO_USER_IS_EMAIL
              )

            ActionVerifications
              .findOne({
                where: {
                  username: credentials.username,
                  actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD,
                  deleted: false
                }
              })
              .then(extract)
              .then(({ username }) => {
                expect(username)
                  .to.equal(credentials.username)
              })
              .then(() => done())
          })
      }
    )
  })

  after(done => {
    server.stop()
    done()
  })
})