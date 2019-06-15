import httpStatus from 'http-status'
import { credentials, baseUrl, verifyRoute } from '../data'
import config from '../setup/app.dev.config.json'
import createServer from '../setup'
import create from '../../scripts/create-database'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { EVENTS } from '../../src/consts'
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

    describe('Verify user by activation link', () => {
        it(`Should return ${httpStatus[httpStatus.OK]}`, done => {
          ActionVerifications
            .findOne({ where: { username: credentials.username }})
            .then(extract)
            .then(({ actionId }) => {
              // server.addListener(EVENTS.USER_CREATED, handler)

              const handler = ({ username, admin }) => {
                expect(username)
                  .to.equal(credentials.username)

                expect(admin)
                  .to.equal(config.adminEmail)

                server.removeListener(EVENTS.USER_APPROVED, handler)
                done()
              }

              server.addListener(EVENTS.USER_APPROVED, handler)

              request
                .get(`${verifyRoute}/${actionId}`)
                .send(credentials)
                .end((err, res) => {
                  expect(res).to.have.status(httpStatus.OK)
                })
            })
        })
      })

  after(done => {
    server.stop()
    done()
  })
})