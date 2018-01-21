const configOption = require('./configOption')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const isAuthenticate = require('./utils/isAuthenticate')

const server = (appConfig) => (
  new Promise((resolve, reject ) => {
    const config = 
      Object
        .assign(
          {},
          configOption,
          appConfig
        )

    global.config = config
    const logger = require('./utils/getLogger')('app')
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json())
    const setUserRoutes = require('./routes/users')
    const userRoute = express.Router({ mergeParams: true })

    setUserRoutes(userRoute)

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