import httpStatus from 'http-status'
import {
  credentials,
  baseUrl,
  signUpRoute,
} from '../data'
import { chaiRequest, expect } from '../setup/chaiHttpHelper'
import { getDbConfigWithInactivrUser } from './helper'

describe('Sign up user', async() =>  {
  const request = chaiRequest(baseUrl)
  let server
  before(done => {
    getDbConfigWithInactivrUser()
      .then(({ server: srv, entities: ents })=>{
        server = srv
      })
      .then(() => done())
  })

  describe('Verify getting error when create user which is exist', () => {
    it(`Should return ${httpStatus[httpStatus.CONFLICT]}`, done => {
      request
        .post(signUpRoute)
        .send(credentials)
        .end((err, res) => {
          const { body } = res
          expect(res).to.have.status(httpStatus.CONFLICT)
          expect(body.message)
            .to.equal(httpStatus[ httpStatus.CONFLICT ])

            done()
        })
    })
  })

  after(done => {
    server.stop()
    done()
  })
})