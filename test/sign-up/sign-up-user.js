import httpStatus from 'http-status'
import uuid from 'uuid'
import {
  credentials,
  baseUrl,
  signUpRoute,
  verifyRoute,
  signInRoute,
  signOutRoute,
  forgotPasswordRoute,
  changePasswordRoute
} from '../data'
import config from '../setup/app.dev.config.json'
import initEntities from '../../src/entities'
import { extract } from '../../src/utils/SequelizeHelper'
import createServer from '../setup'
import create from '../../scripts/create-database'
import removeDatabase from '../setup/removeDatabase'
import { EVENTS, VERBAL_CODE, ACTION_VERIFICATIONS } from '../../src/consts'
import chai from 'chai'
import chaiHttp from 'chai-http'
const TOKEN_KEY = 'token'
const logger = {
  log: () => {},
  info: () => {},
  error: () => {}
}

const { Users, ActionVerifications } = initEntities({ config: config.database, logger })

describe('Sign up/in verify user', () =>  {

  let server
  before(done => {
    removeDatabase()
    create({ config: config.database })
      .then(createServer)
      .then(res => server = res)
      .then(() => done())
  })

  chai.use(chaiHttp)
  const { expect } = chai
  const request =
    chai.request(baseUrl)

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

  describe(`Sign in with valid credential before activated(verifiy)`, () => {
    it(`Should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      done => {
        request
          .post(signInRoute)
          .send(credentials)
          .end((err, res) => {
            const { body } = res
            expect(res).to.have.status(httpStatus.UNAUTHORIZED)
            expect(body.message)
              .to
              .equal(httpStatus[ httpStatus.UNAUTHORIZED ])

              done()
          })
      }
    )
  })
/*
EVENTS = keyMirror({
    USER_CREATED: null,
    NOTIFY_ADMIN_WHEN_USER_APPROVED: null,
    USER_APPROVED: null
})

*/
  describe('Verify user by activation link', () => {
    it(`Should return ${httpStatus[httpStatus.OK]}`, done => {
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

  describe(`Sign in with invalid username`, () => {
    it(`Should return ${httpStatus[httpStatus.UNAUTHORIZED]}`,
      done => {
        request
          .post(signInRoute)
          .send({ ...credentials, password: 'no-' + credentials.username })
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

  describe(`Sign in with valid credential after activated(verifiy)`, () => {
    it(`Should return ${httpStatus[httpStatus.OK]}`,
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

  describe('Verify logout succeded when logout with valid token', () => {
    it(`Should return ${httpStatus[httpStatus.OK]}`,
      done => {
        request
          .post(signInRoute)
          .send(credentials)
          .end((err, res) => {
            const { body } = res
            expect(res).to.have.status(httpStatus.OK)
            const { [TOKEN_KEY]: token } = body

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
    it(`Should return ${httpStatus[httpStatus.FORBIDDEN]}`, (done) => {
      ActionVerifications
        .findOne({
          where: {
            username: credentials.username,
            actionType: ACTION_VERIFICATIONS.ACTIVATE_USER,
            deleted: true
          }
        })
        .then(extract)
        .then(({ actionId }) => {
          request
          .get(`${verifyRoute}/${actionId}`)
          .send(credentials)
          .end((err, res) => {
            expect(res)
              .to.have.status(httpStatus.FORBIDDEN)

            done()
          })
        })
    })
  })

  describe('Verify when posting forgot-password action verification created', () => {
    it(`Should return ${httpStatus[httpStatus.OK]}`,
      done => {
        const { username } = credentials
        request
          .post(forgotPasswordRoute)
          .send({ username })
          .end((err, res) => {
            const { body } = res
            expect(res).to.have.status(httpStatus.OK)
            const message = body.message
            expect(message)
              .to.equal(
                VERBAL_CODE.RESTORE_PASSWORD_LINK_SENT_TO_USER_IS_EMAIL
              )

            ActionVerifications
              .findOne({
                where: {
                  username: credentials.username,
                  actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD,
                  deleted: false
                }
              })
              .then(extract)
              .then(({ username }) => {
                expect(username)
                  .to.equal(credentials.username)
              })
              .then(() => done())
          })
      }
    )
  })

  describe('Verify change password rejected when invalid password/confirmPassword policy', () => {
    it(`Should return '${httpStatus[httpStatus.BAD_REQUEST]}' with message '${VERBAL_CODE.INVALID_PASSWORD_POLICY}'`,
      done => {
        const password = ''
        const confirmPassword = ''

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
              .send({ password, confirmPassword })
              .end((err, res) => {
                const { body } = res
                expect(res)
                  .to.have.status(httpStatus.BAD_REQUEST)

                expect(body.message)
                  .to.equal(VERBAL_CODE.INVALID_PASSWORD_POLICY)

                done()
              })
          })
      }
    )
  })

  describe('Verify change password rejected when confirmPassword not equal to password', () => {
    it(`Should return '${httpStatus[httpStatus.BAD_REQUEST]}' with message '${VERBAL_CODE.CONFIRM_PASSWORD_NOT_EQUAL_TO_PASSWORD}'`,
      done => {
        const password = '12345678'
        const confirmPassword = '98887776'

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
              .send({ password, confirmPassword })
              .end((err, res) => {
                const { body } = res
                expect(res)
                  .to.have.status(httpStatus.BAD_REQUEST)

                expect(body.message)
                  .to.equal(VERBAL_CODE.CONFIRM_PASSWORD_NOT_EQUAL_TO_PASSWORD)

                done()
              })
          })
      }
    )
  })

  describe('Verify change password rejected when user is not valid', () => {
    it(`Should return '${httpStatus[httpStatus.FORBIDDEN]}' with message '${httpStatus[httpStatus.FORBIDDEN]}'`,
      done => {
        const password = '12345678'
        const confirmPassword = '12345678'

        Users
          .findOne({ where: { username: credentials.username } })
          .then(extract)
          .then(({ username }) => (
            Users
              .update({ isValid: false }, { where: { username }, returning: true })
          ))
          .then(() =>
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
                  .send({ password, confirmPassword })
                  .end((err, res) => {
                    const { body } = res

                    expect(res)
                      .to.have.status(httpStatus.FORBIDDEN)

                    expect(body.message)
                      .to.equal(httpStatus[httpStatus.FORBIDDEN])

                    Users
                      .update({ isValid: true }, { where: { username: credentials.username }, returning: true })
                      .then(() => done())

                  })
              })
          )
      }
    )
  })

  describe('Verify change password rejected when invalid actionId', () => {
    it(`Should return '${httpStatus[httpStatus.FORBIDDEN]}' with message '${httpStatus[httpStatus.FORBIDDEN]}'`,
      done => {
        const password = '12345678'
        const confirmPassword = '12345678'

        Promise
          .resolve({ actionId: uuid.v4()})
          .then(( { actionId } ) => {
            request
              .post(`${changePasswordRoute}/${actionId}`)
              .send({ password, confirmPassword })
              .end((err, res) => {
                const { body } = res
                expect(res)
                  .to.have.status(httpStatus.FORBIDDEN)

                expect(body.message)
                  .to.equal(httpStatus[httpStatus.FORBIDDEN])

                done()
              })
          })
      }
    )
  })

  describe('Verify change password succeded when confirmPassword equal to password and match the policy', () => {
    it(`Should return '${httpStatus[httpStatus.OK]}' with message '${VERBAL_CODE.PASSWORD_SUCCESSFULLY_CHANGED}'`,
      done => {
        const password = '12345678'
        const confirmPassword = '12345678'

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
              .send({ password, confirmPassword })
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