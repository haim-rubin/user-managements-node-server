import httpStatus from 'http-status'
import { credentials, signInRoute, userInfo, baseUrl, TOKEN_KEY } from '../data'
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


    describe(`Get user info with valid token`, () => {
      it(`Should return ${httpStatus[httpStatus.OK]} and username`,
        done => {
          const password = '12345678'
          request
            .post(signInRoute)
            .send({ ...credentials, password })
            .end((err, res) => {
              const { body } = res
              expect(res).to.have.status(httpStatus.OK)
              const { [TOKEN_KEY]: token } = body
              request
                .get(userInfo)
                .set('token', token)
                .end((err, res) => {
                  const { body } = res
                  expect(res).to.have.status(httpStatus.OK)
                  expect(body.username).to.equal(credentials.username)
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