import './polyfills'
import express from 'express'
import bodyParser from 'body-parser'
import initUserApis from './routes/users'
import initFallBacks from './fallbacks'
import crypto from 'crypto'
import querystring from 'querystring'

const server = ({ appConfig, ...externals}) => (
  new Promise((resolve, reject ) => {


  const getUserAgentUniqueIdentify = (userAgentInfo) => {
    return new Promise((resolve, reject) => {
      try {
        const userMachineIdentity =
          appConfig.useSingleToken
          ? { username: userAgentInfo.username }
          : userAgentInfo

        const hash =
          crypto.createHash('sha256')

        resolve(
          hash
            .update(
              querystring
                .stringify(
                  userMachineIdentity
                )
            )
            .digest('hex')
        )
      }
      catch(error){
        reject(error)
      }
    })
  }
    try{
      process.setMaxListeners(0)
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
      const userRouter = express.Router({ mergeParams: true })
      const { userRoutePrefix } = config
      initUserApis({
        ...settings,
        userRoutePrefix,
        getUserAgentUniqueIdentify,
      })(userRouter, app)
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
  server
}