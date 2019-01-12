import loggerInit from '../utils/logger/init'
import init3rdPartyProviders from './verifyThirdpartyToken'
import initEntities from '../entities'
import initTemplateManagements from '../services/template-managements'
import { compile } from '../services/template-render'
import configOption from '../configOption.json'
import initAuthentication from '../controllers/authentication'
import initUsersComponents from '../controllers/users'
import path from 'path'
import EventEmmiter from 'events'
import defaultAuditLogger from './auditLogger'

const getAbsoluteTemplates = (templates, dirname) => (
    Object
      .entries(templates)
      .map(([key, value]) => ({
        [key]: path.resolve(dirname, value)
      }))
      .arrayPropToObject()
  )

const init = ({ appConfig, externals, relDirname }) => {
    const config = {
        ...configOption,
        ...appConfig,
        templates: appConfig.templates
        ? appConfig.templates
        : getAbsoluteTemplates(configOption.templates, relDirname)
    }

    const events = new EventEmmiter()
    const emit = events.emit.bind(events)
    const on = events.on.bind(events)

    const logger =
        externals.logger
        || loggerInit(config.log4js).getLogger('app')

    const _3rdPartyProviders =
        externals._3rdPartyProviders
        || init3rdPartyProviders({ config })

    const dal =
        externals.dal
        || initEntities({ config: config.database, logger })

    const { getVerifyResponseHTML } = initTemplateManagements({
        ...config,
        compile
    })

    const auditLogger =
        externals.auditLogger
        || defaultAuditLogger

    const settings = {
        ...initUsersComponents({
            config,
            logger,
            _3rdPartyProviders,
            dal,
            emit
          }),
          ...initAuthentication({ logger, config }),
        getVerifyResponseHTML: error => (
            getVerifyResponseHTML({ error, link: config.loginUrl, appName: config.appName })
        ),
        auditLogger
    }

    return {
        settings,
        logger,
        config,
        on
    }
}

export default init