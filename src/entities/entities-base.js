
import models from '../models'
import sequelize from 'sequelize'
import initConn from './conn'

const init = ({ config }) => {
  const conn = initConn({ config })
  const entities =
    Object
      .keys(models)
      .map((key) => (
        { [key]: models[key](conn, sequelize) }
      ))
      .reduce((obj, propValue) => (
        Object.assign({}, obj, propValue)
      ), {})

  return entities
}

export default init