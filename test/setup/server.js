const { server } = require('../../index')
const config = require('./app.dev.config')

module.exports = () => (
  server(config)
    .then(({ host, port, stop }) => {
      console.log(`Server run on: ${host}${port? ':' + port: ''}`)
      return { host, port, stop }
    })
    .catch(error => {
      console.log(error)
    })
  )