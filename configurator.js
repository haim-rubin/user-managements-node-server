const config = process.env.ENVIRONMENT === 'production' ?
  require('./config/app.prod.config') : require('./config/app.dev.config')

module.exports = config
