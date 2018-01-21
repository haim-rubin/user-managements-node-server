const models = require('../models')
const conn = require('./conn')
const sequelize = require('sequelize')

const entities =
  Object
    .keys(models)
    .map((key) => (
      { [key]: models[key](conn, sequelize) }
    ))
    .reduce((obj, propValue) => (
      Object.assign({}, obj, propValue)
    ), {})

module.exports = entities