import httpStatus from 'http-status'
import { credentials, baseUrl, changePasswordRoute } from '../data'
import config from '../setup/app.dev.config.json'
import createServer from '../setup'
import create from '../../scripts/create-database'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import initEntities from '../../src/entities'
import { logger } from '../setup/mocks/logger'
import { ACTION_VERIFICATIONS } from '../../src/consts'
import { extract } from '../../src/utils/SequelizeHelper'

const { ActionVerifications, Users } = initEntities({ config: config.database, logger })

describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  before(done => {
      create({ config: config.database })
      .then(createServer)
      .then(res => server = res)
      .then(() => done())
  })

  describe('Verify change password rejected when user is not valid', () => {
    it(`Should return '${httpStatus[httpStatus.FORBIDDEN]}' with message '${httpStatus[httpStatus.FORBIDDEN]}'`,
      done => {
        const password = '12345678'
        const confirmPassword = '12345678'

        Users
          .findOne({ where: { username: credentials.username } })
          .then(extract)
          .then(({ username }) => (
            Users
              .update({ isValid: false }, { where: { username }, returning: true })
          ))
          .then(() =>
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
                  .send({ password, confirmPassword })
                  .end((err, res) => {
                    const { body } = res

                    expect(res)
                      .to.have.status(httpStatus.FORBIDDEN)

                    expect(body.message)
                      .to.equal(httpStatus[httpStatus.FORBIDDEN])

                    Users
                      .update({ isValid: true }, { where: { username: credentials.username }, returning: true })
                      .then(() => done())

                  })
              })
          )
      }
    )
  })
  after(done => {
    server.stop()
    done()
  })
})