import httpStatus from 'http-status'
import { credentials, baseUrl, signInRoute } from '../data'
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

    describe(`Sign in with invalid password`, () => {
        it(`Should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
        done => {
          request
            .post(signInRoute)
            .send({ ...credentials, password: 'no-' + credentials.password })
            .end((err, res) => {
              const { body } = res
              expect(res).to.have.status(httpStatus.UNAUTHORIZED)
              expect(body.message)
                .to.equal(httpStatus[ httpStatus.UNAUTHORIZED ])

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