import httpStatus from 'http-status'
import { credentials, baseUrl, verifyRoute } from '../data'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { ACTION_VERIFICATIONS } from '../../src/consts'
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

  describe('Verify activation link obsolete', () => {
    it(`Should return ${httpStatus[httpStatus.FORBIDDEN]}`, (done) => {
      ActionVerifications
        .findOne({
          where: {
            username: credentials.username,
            actionType: ACTION_VERIFICATIONS.ACTIVATE_USER,
            deleted: true
          }
        })
        .then(extract)
        .then(({ actionId }) => {
          request
          .get(`${verifyRoute}/${actionId}`)
          .send(credentials)
          .end((err, res) => {
            expect(res)
              .to.have.status(httpStatus.FORBIDDEN)

            done()
          })
        })
    })
  })

  after(done => {
    server.stop()
    done()
  })
})