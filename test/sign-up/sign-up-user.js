import httpStatus from 'http-status'
import { credentials, baseUrl, signUpRoute, verifyRoute, signInRoute, signOutRoute } from '../data'
import config from '../setup/app.dev.config.json'
import initEntities from '../../src/entities'
import { extract } from '../../src/utils/SequelizeHelper'
import createServer from '../setup'
import create from '../../scripts/create-database'
import removeDatabase from '../setup/removeDatabase'
import chai from 'chai'
import chaiHttp from 'chai-http'
const TOKEN_KEY = 'token'
const logger = {
  log: () => {},
  info: () => {},
  error: () => {}
}
const { Users, ActionVerifications } = initEntities({ config: config.database, logger })

describe('Sign-up user', () =>  {

  before(done => {
    removeDatabase()
    create({ config: config.database })
      .then(createServer)
      .then(() => done())
  })

  chai.use(chaiHttp)
  const { expect } = chai
  const request =
    chai.request(baseUrl)

  describe('Verify create user', () => {
    it(`Should return ${httpStatus[httpStatus.CREATED]}`,
      done => {
        request
          .post(signUpRoute)
          .send(credentials)
          .end((err, res) => {
            expect(res).to.have.status(httpStatus.CREATED)
            expect(JSON.parse(res.text).message)
              .to
              .equal(httpStatus[ httpStatus.CREATED ])

              done()
          })
      }
    )
  })

  describe('Verify getting error when create user which is exist', () => {
    it(`should return ${httpStatus[httpStatus.CONFLICT]}`,

    done => {
      request
        .post(signUpRoute)
        .send(credentials)
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.CONFLICT)
          expect(JSON.parse(res.text).message)
            .to
            .equal(httpStatus[ httpStatus.CONFLICT ])

            done()
        })
    })
  })

  describe(`Sign in with valid credential before activated(verifiy)`, () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      done => {
        request
          .post(signInRoute)
          .send(credentials)
          .end((err, res) => {
            expect(res).to.have.status(httpStatus.UNAUTHORIZED)
            expect(JSON.parse(res.text).message)
              .to
              .equal(httpStatus[ httpStatus.UNAUTHORIZED ])

              done()
          })
      }
    )
  })

  describe('Verify user by activation link', () => {
    it(`should return ${httpStatus[httpStatus.OK]}`, done => {
      ActionVerifications
        .findOne({ where: { username: credentials.username }})
        .then(extract)
        .then(({ actionId }) => {
          request
            .get(`${verifyRoute}/${actionId}`)
            .send(credentials)
            .end((err, res) => {
              expect(res).to.have.status(httpStatus.OK)

              done()
            })
        })
    })
  })

  describe(`Sign in with invalid password`, () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
    done => {
      request
        .post(signInRoute)
        .send({ ...credentials, password: 'no-' + credentials.password })
        .end((err, res) => {
          expect(res).to.have.status(httpStatus.UNAUTHORIZED)
          expect(JSON.parse(res.text).message)
            .to.equal(httpStatus[ httpStatus.UNAUTHORIZED ])

            done()
        })
      }
    )
  })

  describe(`Sign in with invalid username`, () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      done => {
        request
          .post(signInRoute)
          .send({ ...credentials, password: 'no-' + credentials.username })
          .end((err, res) => {
            expect(res).to.have.status(httpStatus.UNAUTHORIZED)
            expect(JSON.parse(res.text).message)
              .to
              .equal(httpStatus[ httpStatus.UNAUTHORIZED ])

              done()
          })
      }
    )
  })

  describe(`Sign in with valid credential after activated(verifiy)`, () => {
    it(`should return ${httpStatus[httpStatus.OK]}`,
      done => {
        request
          .post(signInRoute)
          .send(credentials)
          .end((err, res) => {
            expect(res).to.have.status(httpStatus.OK)

            done()
          })
      }
    )
  })

  describe('Verify logout fail when logout without token', () => {
    it(`should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
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

  describe('Verify logout succeded when logout with valid token', () => {
    it(`should return ${httpStatus[httpStatus.OK]}`,
      done => {
        request
          .post(signInRoute)
          .send(credentials)
          .end((err, res) => {
            expect(res).to.have.status(httpStatus.OK)

            const { [TOKEN_KEY]: token } =
              JSON.parse(res.text)

            request
              .post(signOutRoute)
              .set(TOKEN_KEY, token)
              .send(credentials)
              .end((err, res) => {
                expect(res).to.have.status(httpStatus.OK)
                done()

              })
          })
      }
    )
  })

  describe('Verify activation link obsolete', () => {
    it(`should return ${httpStatus[httpStatus.FORBIDDEN]}`, (done) => {
      ActionVerifications
        .findOne({ where: { username: credentials.username }})
        .then(extract)
        .then(({ actionId }) => {
          request
          .get(`${verifyRoute}/${actionId}`)
          .send(credentials)
          .end((err, res) => {
            expect(res).to.have.status(httpStatus.FORBIDDEN)

            done()
          })
        })
    })
  })
})