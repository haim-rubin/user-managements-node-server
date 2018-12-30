import './polyfills'
import configOption from './configOption'
import express from 'express'
import bodyParser from 'body-parser'
import isAuthenticate from './utils/isAuthenticate'
import loggerInit from './utils/logger/init'
import initUserApis from './routes/users'
import init3rdPartyProviders from './services/verify-third-party-token'
import initAuthntication from './controllers/authentication'
import initUsersComponents from './controllers/users'
import path from 'path'

const initUserImplementations = ({
  config,
  logger,
  _3rdPartyProviders
}) => ({
  ...initUsersComponents({
    config,
    logger,
    _3rdPartyProviders
  }),
  ...initAuthntication({ logger, config })
})

const getAbsoluteTemplates = (templates, dirname) => (
  Object
    .entries(templates)
    .map(([key, value]) => ({
      [key]: path.resolve(dirname, value)
    }))
    .arrayPropToObject()
)

const server = (appConfig) => (
  new Promise((resolve, reject ) => {

    try{
      const config = {
        ...configOption,
        ...appConfig,
        templates: appConfig.templates
        ? appConfig.templates
        : getAbsoluteTemplates(configOption.templates, __dirname)
      }

      const logger = loggerInit(config.log4js).getLogger('app')
      const app = express()

      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json())

      const userRoute = express.Router({ mergeParams: true })
      const _3rdPartyProviders = init3rdPartyProviders({ config })

      initUserApis(
        initUserImplementations({
          config,
          logger,
          _3rdPartyProviders
        })
      )(userRoute)

      app.use(config.userRoute, /* validateInput, writeAudit ,*/ userRoute)

      const server = app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`)
        resolve({
          host: server.address().address,
          port: server.address().port,
          stop: server.close
        })  
      })
      }catch(error){
        reject(error)
      }
    })
  )

module.exports = {
  server,
  isAuthenticate
}