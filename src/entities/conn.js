const { config } = global
const Sequelize = require('sequelize')

const { name, username, password, host, dialect, pool, logging } = config.database

const conn = new Sequelize(name, username, password, { host, dialect, pool, logging })

module.exports = conn
