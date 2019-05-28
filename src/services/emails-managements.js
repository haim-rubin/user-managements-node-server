import initEmail from '../utils/emailProvider'
import initTemplateManagement from './template-managements'

const init = ({ config }) => {
    const {
        getActivationEmailParams,
        getApprovedActivationEmailParams,
        getNotifyAdminWhenUserCreatedParams } = initTemplateManagement(config)

    const { send } = initEmail({ config: config.email })

    const sendActivationEmail = ({ actionId, username }) => {
        const email =
            config.verifyUserBy? config.adminEmail : username

        const { body: html, subject } =
            getActivationEmailParams({ username, actionId })

        return send({from: config.email.from, to: email, subject, html })
    }


    const sendApprovedActivationEmail = ({ username }) => {

        const { body: html, subject } =
            getApprovedActivationEmailParams({ username })

        return send({from: config.email.from, to: username, subject, html })
    }

    const sendResetPasswordEmail = ({ actionId, username }) =>{

    }

    const sendNotificationToAdminWhenUserCreated = ({ username, admin, fullName }) => {
        const { body: html, subject} =
            getNotifyAdminWhenUserCreatedParams({ username, admin, fullName })

        return send({from: config.email.from, to: admin, subject, html })
    }

    return {
        sendActivationEmail,
        sendResetPasswordEmail,
        sendApprovedActivationEmail,
        sendNotificationToAdminWhenUserCreated
    }

}
export default init