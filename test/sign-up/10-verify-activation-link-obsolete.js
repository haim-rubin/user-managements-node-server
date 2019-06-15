import httpStatus from 'http-status'
import { credentials, baseUrl, verifyRoute } from '../data'
import config from '../setup/app.dev.config.json'
import createServer from '../setup'
import create from '../../scripts/create-database'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { ACTION_VERIFICATIONS } from '../../src/consts'
import initEntities from '../../src/entities'
import { logger } from '../setup/mocks/logger'
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