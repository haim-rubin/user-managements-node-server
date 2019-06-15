import httpStatus from 'http-status'
import { credentials, baseUrl, signOutRoute } from '../data'
import config from '../setup/app.dev.config.json'
import createServer from '../setup'
import create from '../../scripts/create-database'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'

describe('Sign up user', () =>  {
  const request = chaiRequest(baseUrl)
  let server
  before(done => {
    create({ config: config.database })
      .then(createServer)
      .then(res => server = res)
      .then(() => done())
  })

  describe('Verify logout fail when logout without token', () => {
    it(`Should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      done => {
        request
          .post(signOutRoute)
          .send(credentials)
          .end((err, res) => {
            expect(res).to.have.status(httpStatus.UNAUTHORIZED)

            done()
          })
      }
    )
  })

  after(done => {
    server.stop()
    done()
  })
})