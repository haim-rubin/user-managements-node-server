import { EVENTS } from '../consts'
import addActivationEmailListener from './emails/activation'
import addApprovedEmailListener from './emails/approved'
import addNotifyEmailListener from './emails/notify'
import initEmailSend from '../utils/emailProvider'

const isMissingSettings = obj => (
    Object
        .entries(obj)
        .filter(([key, value]) => !value)
        .map(([key]) => `${key} was not supplied`)
)

const tryAssignListenerOrGetErrors = ({ templates, params, title, assign }) =>{
    const templatesMissingSettings =
        isMissingSettings({
            body: null,
            subject: null,
            ...templates
        })

    if(!!templatesMissingSettings.length){
        return (
            templatesMissingSettings
                .unshift(`The following ${title} email templates is missing`)
        )
    }

    assign({
        ...templates,
        ...params
    })

    return []
}

const manageActivationEmails = ({
    addListener,
    config,
    relDirname,
}) => {

    const { verificationUrl, loginUrl, adminEmail, appName, email = {} } = config
    const missingEmailSettings =
        isMissingSettings(email)

    if(!!missingEmailSettings.length) {
        return (
            ['The following email setting is missing, emails will not be send to users']
                .concat(missingEmailSettings)
        )
    }

    const {
        activation,
        approved,
        notify
    } = config.templates

    const defaultParams = {
        from: email.from,
        appName,
        send:(
            initEmailSend({
                config: email
            }).send
        ),
        addListener,
        relDirname
    }

    const activationErrors =
        tryAssignListenerOrGetErrors({
            templates: activation,
            params: {
                ...defaultParams,
                verificationUrl,
                event: EVENTS.USER_CREATED
            },
            title: 'activation',
            assign: addActivationEmailListener
        })

    const approvedErrors =
        tryAssignListenerOrGetErrors({
            templates: approved,
            params: {
                ...defaultParams,
                loginUrl,
                event: EVENTS.USER_APPROVED
            },
            title: 'approved',
            assign: addApprovedEmailListener
        })

    const notifyErrors =
        tryAssignListenerOrGetErrors({
            templates: notify,
            params: {
                ...defaultParams,
                admin: adminEmail,
                event: EVENTS.NOTIFY_ADMIN_WHEN_USER_APPROVED
            },
            title: 'notify',
            assign: addNotifyEmailListener
        })

    return (
        []
        .concat(activationErrors)
        .concat(approvedErrors)
        .concat(notifyErrors)
    )
}

export default manageActivationEmails