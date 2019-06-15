import httpStatus from 'http-status'
import {
  credentials,
  baseUrl,
  signUpRoute,
} from '../data'
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

    describe('Verify getting error when create user which is exist', () => {
        it(`Should return ${httpStatus[httpStatus.CONFLICT]}`,

        done => {
          request
            .post(signUpRoute)
            .send(credentials)
            .end((err, res) => {
              const { body } = res
              expect(res).to.have.status(httpStatus.CONFLICT)
              expect(body.message)
                .to
                .equal(httpStatus[ httpStatus.CONFLICT ])

                done()
            })
        })
      })

  after(done => {
    server.stop()
    done()
  })
})