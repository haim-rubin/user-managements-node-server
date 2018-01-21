
const { config } = global
const { compileTemplate } = require('./template-render')
const { templates } = config
const activationBody = require(templates.activationBody)
const activationSubject = require(templates.activationSubject)
const activationResponse = require(templates.activationResponse)
const activationBodyApproved = require(templates.activationBodyApproved)
const activationSubjectApproved = require(templates.activationSubjectApproved)
const notifyBodyAdminWhenUserCreated = require(templates.notifyBodyAdminWhenUserCreated)
const notifySubjectAdminWhenUserCreated = require(templates.notifySubjectAdminWhenUserCreated)

const getActivationEmailParams = ({ actionId, username }) => {
  const body = compileTemplate(activationBody)({
    verificationUrl: config.verificationUrl,
    appName: config.appName,
    actionId,
    username
  })

  const subject = compileTemplate(activationSubject)({
    appName: config.appName
  })

  return { body, subject }
}

const getApprovedActivationEmailParams = ({  username }) => {
  const body = 
    compileTemplate(activationBodyApproved)({
        loginUrl: config.loginUrl,
        appName: config.appName,
        username
    })

  const subject = 
    compileTemplate(activationSubjectApproved)({
        appName: config.appName
    })

  return { body, subject }
}

const getVerifyResponseHTML = ({ appName, error, link }) => {
 
  const html = 
    compileTemplate(activationResponse)({
        appName,
        error,
        link
    })

  return html
}

const getNotifyAdminWhenUserCreatedParams = ({ username, fullName, admin }) => {
  const body =
    compileTemplate(notifyBodyAdminWhenUserCreated)({
      username,
      fullName,
      admin
    })

  const subject =
    compileTemplate(notifySubjectAdminWhenUserCreated)({
        appName: config.appName,
        username
    })

  return { body, subject }
}

module.exports = {
  getActivationEmailParams,
  getApprovedActivationEmailParams,
  getVerifyResponseHTML,
  getNotifyAdminWhenUserCreatedParams 
}