import { server } from '../../index'
import config from './app.dev.config'
export default () => {
  return server({ appConfig: config })
}