import shell from 'shelljs'
import config from './app.dev.config.json'
export default () => shell.rm(config.database.settings.storage)