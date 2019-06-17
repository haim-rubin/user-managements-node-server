import httpStatus from 'http-status'
import { credentials, baseUrl, verifyRoute } from '../data'
import config from '../setup/app.dev.config.json'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { EVENTS } from '../../src/consts'
import { extract } from '../../src/utils/SequelizeHelper'
import { getDbConfigWithInactivrUser } from './helper'

describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  let ActionVerifications
  before(done => {
    getDbConfigWithInactivrUser()
      .then(({ server: srv, entities })=>{
        server = srv
        ActionVerifications = entities.ActionVerifications
      })
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