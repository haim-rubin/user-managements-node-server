import httpStatus from 'http-status'
import { userInfo, baseUrl } from '../data'
import config from '../setup/app.dev.config.json'
import createServer from '../setup'
import create from '../../scripts/create-database'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import uuid from 'uuid'
describe('Sign up user', () =>  {
    const request = chaiRequest(baseUrl)
    let server
    before(done => {
      create({ config: config.database })
        .then(createServer)
        .then(res => server = res)
        .then(() => done())
    })


  describe(`Get user info with invalid token`, () => {
    it(`Should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      done => {
        request
          .get(userInfo)
          .set('token', uuid.v4())
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