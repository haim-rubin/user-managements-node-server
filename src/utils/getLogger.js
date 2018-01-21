const getLogger = ( appender = 'app' ) => {
    const log4js = require('log4js')
    log4js.configure(
        global.config.log4js
    )
    return log4js.getLogger(appender)
}

module.exports = getLogger