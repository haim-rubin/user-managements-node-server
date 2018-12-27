import configOption from './configOption'
import express from 'express'
import bodyParser from 'body-parser'
import isAuthenticate from './utils/isAuthenticate'
import loggerInit from './utils/logger/init'
import setUserRoutes from './routes/users'


const server = (appConfig) => (
  new Promise((resolve, reject ) => {
    const config = 
      Object
        .assign(
          {},
          configOption,
          appConfig
        )

    const logger = loggerInit(config.log4js).getLogger('app')
    const app = express()
        
    global.config = config
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json())
    
    const userRoute = express.Router({ mergeParams: true })

    setUserRoutes({ config: appConfig, logger })(userRoute)

    app.use(config.userRoute, /* validateInput, writeAudit ,*/ userRoute)

    const server = app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`)
      resolve({
        host: server.address().address,
        port: server.address().port,
        stop: server.close
      })
    })
  }
))

module.exports = {
  server,
  isAuthenticate
}