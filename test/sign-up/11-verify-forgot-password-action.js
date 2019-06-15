import httpStatus from 'http-status'
import { credentials, baseUrl, forgotPasswordRoute } from '../data'
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