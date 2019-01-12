import './polyfills'
import configOption from './configOption.json'
import express from 'express'
import bodyParser from 'body-parser'
import isAuthenticate from './utils/isAuthenticate'
import loggerInit from './utils/logger/init'
import initUserApis from './routes/users'
import init3rdPartyProviders from './services/verify-third-party-token'
import initAuthentication from './controllers/authentication'
import initUsersComponents from './controllers/users'
import initTemplateManagements from './services/template-managements'
import { compile } from './services/template-render'
import path from 'path'
import initEntities from './entities'

const initUserImplementations = ({
  config,
  logger,
  _3rdPartyProviders,
  dal
}) => ({
  ...initUsersComponents({
    config,
    logger,
    _3rdPartyProviders,
    dal
  }),
  ...initAuthentication({ logger, config })
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


      const { getVerifyResponseHTML } = initTemplateManagements({
          ...config,
          compile
        })
      const getFriendlyLogObject = obj => (
        Object
          .entries(obj)
          .map(([key, value]) =>(
            `${key}: ${value}`
          ))
          .join(',')
      )

      const getFriendlyLogObjectIfHasKeys = (obj, key) => (
        Object
          .keys(obj).length
        ? `${key}: { ${getFriendlyLogObject(obj) } }`
        : ''
      )
      initUserApis({

        ...initUserImplementations({
          config,
          logger,
          _3rdPartyProviders,
          dal: initEntities({ config: config.database, logger })
        }),
        getVerifyResponseHTML: error => (
          getVerifyResponseHTML({ error, link: config.loginUrl, appName: config.appName })
        ),
        //:Object {username: "haim.rubin@gmail.com", password: "123456"}
        auditLogger: ({
          body,
          clientInfo: { ip, userAgent },
          originalUrl,
          params,
          query }) => {

          const friendlyObjInfo = [
            getFriendlyLogObjectIfHasKeys(body, 'body'),
            getFriendlyLogObjectIfHasKeys(params, 'params'),
            getFriendlyLogObjectIfHasKeys(query, 'query')
          ]
          .filter(x => x)
          .join(', ')

          logger.info(
            `${originalUrl}: { ip: ${ip}, ${ friendlyObjInfo} }`
          )
        }
      })(userRoute)

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

export {
  server,
  isAuthenticate
}