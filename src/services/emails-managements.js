const { config } = global
const { send } = require('./email-provider')(config.email)
const { getActivationEmailParams, getApprovedActivationEmailParams, getNotifyAdminWhenUserCreatedParams } = require('./template-managements')

const sendActivationEmail = ({ actionId, username }) => {
    const email =
        config.verifyUserByAdmin? config.adminEmail : username

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

module.exports = {
    sendActivationEmail,
    sendResetPasswordEmail,
    sendApprovedActivationEmail,
    sendNotificationToAdminWhenUserCreated
}

