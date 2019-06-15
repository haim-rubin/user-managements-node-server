import httpStatus from 'http-status'
import {
  credentials,
  baseUrl,
  signUpRoute,
} from '../data'
import config from '../setup/app.dev.config.json'
import createServer from '../setup'
import create from '../../scripts/create-database'
import removeDatabase from '../setup/removeDatabase'
import { EVENTS } from '../../src/consts'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'

describe('Sign up user', () =>  {
    const request = chaiRequest(baseUrl)
    let server
    before(done => {
        removeDatabase()
        create({ config: config.database })
        .then(createServer)
        .then(res => server = res)
        .then(() => done())
    })

  describe('Verify create user', () => {
    it(`Should return ${httpStatus[httpStatus.CREATED]}`,
      done => {

        const handler = ({ username, isValid }) => {
          expect(username)
            .to.equal(credentials.username)

          expect(isValid)
            .to.equal(false)

          server.removeListener(EVENTS.USER_CREATED, handler)
          done()
        }

        server.addListener(EVENTS.USER_CREATED, handler)

        request
          .post(signUpRoute)
          .send(credentials)
          .end((err, res) => {
            const { body } = res
            expect(res).to.have.status(httpStatus.CREATED)
            expect(body.message)
              .to
              .equal(httpStatus[ httpStatus.CREATED ])
          })
      }
    )
  })

  after(done => {
    server.stop()
    done()
  })
})