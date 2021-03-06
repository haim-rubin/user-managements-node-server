import loggerInit from '../utils/logger/init'
import init3rdPartyProviders from './verifyThirdpartyToken'
import initEntities from '../entities'
import configOption from '../configOption.json'
import initAuthentication from '../components/authentication'
import initUsersComponents from '../components/users'
import path from 'path'
import EventEmmiter from 'events'
import defaultAuditLogger from './auditLogger'
import { mergeTemplates } from './utils'
import manageActivationEmails from './manageActivationEmails'
import initVerify from '../utils/getVerifyResponseHTML'
import { compile } from '../fallbacks/compileTemplate'

const getAbsoluteTemplates = (templates, dirname) => (
    Object
      .entries(templates)
      .map(([key, value]) => ({
        [key]: path.resolve(dirname, value)
      }))
      .arrayPropToObject()
  )

const getTemplatePath = (filePath) => {
    return (
        path
            .isAbsolute(filePath)
        ? filePath
        : path.join(__dirname, '../', filePath)
    )
}


const init = ({ appConfig, externals, relDirname }) => {
    const config = {
        ...configOption,
        ...appConfig,
        templates:
            mergeTemplates({ templates: appConfig.templates, defaultTemplates: configOption.templates })
    }

    const getVerifyResponseHTML = initVerify({
        compile,
        activationResponse: getTemplatePath(config.templates.activationResponse)
    })

    const events = new EventEmmiter()
    const emit = events.emit.bind(events)
    const addListener = events.addListener.bind(events)
    const removeListener =  events.removeListener.bind(events)

    const emailErrors =
        manageActivationEmails({
            addListener,
            removeListener,
            config,
            relDirname,
        })

    const logger =
        externals.logger
        || loggerInit(config.log4js).getLogger('app')

    const _3rdPartyProviders =
        externals._3rdPartyProviders
        || init3rdPartyProviders({ config })

    const dal =
        externals.dal
        || initEntities({ config: config.database, logger })

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
        addListener,
        removeListener,
    }
}

export default init