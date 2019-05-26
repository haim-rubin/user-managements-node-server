import { server } from '../../index'
import config from './app.dev.config'
import create from '../../scripts/create-database'
import removeDatabase from './removeDatabase'
export default () => {
  removeDatabase()
  create({ config: config.database })
  return server({ appConfig: config })
    .then(({ host, port, stop, on }) => {
      console.log(`Server run on: ${host}${port? ':' + port: ''}`)
      //process.g
      return { host, port, stop, on }
    })
    .catch(error => {
      console.log(error)
    })
  }