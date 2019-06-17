import {
  credentials,
  baseUrl,
  signUpRoute,
  signInRoute
} from '../data'
import { chaiRequest } from '../setup/chaiHttpHelper'
import config from '../setup/app.dev.config.json'
import { logger } from '../setup/mocks/logger'
import initEntities from '../../src/entities'
import path from 'path'
import createServer from '../setup'
import create from '../../scripts/create-database'
import util from 'util'
import fs from 'fs'
import uuid from 'uuid'
export const dbWithUserDoesNotActivated = path.join( __dirname, '../data/db-with-user-does-not-activated.sqlite')
export const dbWithActivatedUser = path.join( __dirname, '../data/db-with-activated-user.sqlite')
const copyFile = util.promisify(fs.copyFile)
import { server } from '../../index'

const { ActionVerifications } = initEntities({ config: config.database, logger })
const request = chaiRequest(baseUrl)

const getServerWithDbReady = (dbTest, existingDb) => {
    const database = {
        ...config.database,
        settings: {
            ...config.database.settings,
            storage: dbTest
        }
    }
    return (
        copyFile(
            existingDb,
            dbTest
        )
        .then(() => ({ database, dbTest }))
        .then(({ database, dbTest }) => (
            initEntities({ config: database, logger })
        ))
        .then(entities =>{
            const appConfig = { ...config, database }
            return server({ appConfig })
                .then(server => ({
                    server,
                    entities
                }))
        })
    )
}

export const getDbConfigWithInactiveUser = () => {
    const dbTest = `/tmp/${uuid.v4()}${path.extname(dbWithUserDoesNotActivated)}`
    return (
        getServerWithDbReady(dbTest, dbWithUserDoesNotActivated)
    )
}

export const getDbConfigWithActivatedUser = () => {
    const dbTest = `/tmp/${uuid.v4()}${path.extname(dbWithActivatedUser)}`
    return (
        getServerWithDbReady(dbTest, dbWithActivatedUser)
    )
}
export const initServerWithUserInactiveUser = (config) => {
    return (
        create({ config })
            .then(createServer)
    )
}

export const tryCreateUser = () => (
    request
        .post(signUpRoute)
        .send(credentials)
)

export const tryLogin = () => (
    request
        .post(signInRoute)
        .send(credentials)
)

export const createUserAndActivate = () => (
    tryCreateUser()
        .end(async err => {
            const { actionId } = await ActionVerifications
                .findOne({ where: { username: credentials.username }})
                .then(extract)

            return (
                request
                    .get(`${verifyRoute}/${actionId}`)
            )
        })
)