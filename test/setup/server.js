import { server } from '../../index'
import configOption from '../../src/configOption.json' 
import config from './app.dev.config'

export default () => (
  server({
    //...configOption,
    ...config,
  })
    .then(({ host, port, stop }) => {
      console.log(`Server run on: ${host}${port? ':' + port: ''}`)
      return { host, port, stop }
    })
    .catch(error => {
      console.log(error)
    })
  )