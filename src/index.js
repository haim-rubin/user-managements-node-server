import './polyfills'
import express from 'express'
import bodyParser from 'body-parser'
import isAuthenticate from './utils/isAuthenticate'
import initUserApis from './routes/users'
import initFallBacks from './fallbacks'

const server = ({ appConfig, ...externals}) => (
  new Promise((resolve, reject ) => {

    try{

      const {
        settings,
        logger,
        config,
        addListener,
        removeListener,
      } = initFallBacks({ appConfig, externals, relDirname: __dirname })

      const app = express()
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json())
      const userRoute = express.Router({ mergeParams: true })
      initUserApis(settings)(userRoute)
      app.use(config.userRoute, /* validateInput, writeAudit ,*/ userRoute)
      const server = app.listen(config.port, () => {
        logger.info(`Server is running on port ${config.port}`)
        resolve({
          host: server.address().address,
          port: server.address().port,
          stop: server.close.bind(server),
          addListener,
          removeListener,
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