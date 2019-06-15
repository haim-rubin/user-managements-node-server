import httpStatus from 'http-status'
import { credentials, baseUrl, changePasswordRoute } from '../data'
import config from '../setup/app.dev.config.json'
import createServer from '../setup'
import create from '../../scripts/create-database'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import initEntities from '../../src/entities'
import { logger } from '../setup/mocks/logger'
import { ACTION_VERIFICATIONS, VERBAL_CODE } from '../../src/consts'
import { extract } from '../../src/utils/SequelizeHelper'

const { ActionVerifications } = initEntities({ config: config.database, logger })

describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  before(done => {
    create({ config: config.database })
      .then(createServer)
      .then(res => server = res)
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