import httpStatus from 'http-status'
import { credentials, baseUrl, changePasswordRoute } from '../data'
import config from '../setup/app.dev.config.json'
import createServer from '../setup'
import create from '../../scripts/create-database'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { ACTION_VERIFICATIONS, VERBAL_CODE } from '../../src/consts'
import { extract } from '../../src/utils/SequelizeHelper'

import initEntities from '../../src/entities'
import { logger } from '../setup/mocks/logger'
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

  describe('Verify change password succeded when confirmPassword equal to password and match the policy', () => {
    it(`Should return '${httpStatus[httpStatus.OK]}' with message '${VERBAL_CODE.PASSWORD_SUCCESSFULLY_CHANGED}'`,
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
              .send({ password: '12345678', confirmPassword: '12345678' })
              .end((err, res) => {
                const { body } = res
                expect(res)
                  .to.have.status(httpStatus.OK)

                expect(body.message)
                  .to.equal(VERBAL_CODE.PASSWORD_SUCCESSFULLY_CHANGED)

                ActionVerifications
                  .findOne({
                    where: {
                      username: credentials.username,
                      actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD,
                      deleted: true
                    }
                  })
                  .then(extract)
                  .then(( { actionId: deletedActionId, deleted } ) => {
                    expect(deletedActionId)
                      .to.equal(actionId)

                    expect(deleted)
                      .to.equal(true)

                    done()
                  })
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