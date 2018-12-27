import { compileTemplate } from './template-render'
const init = ({ verificationUrl, loginUrl, appName, templates }) => {

  const {
    activationBody,
    activationSubject,
    activationResponse,
    activationBodyApproved,
    activationSubjectApproved,
    notifyBodyAdminWhenUserCreated,
    notifySubjectAdminWhenUserCreated } = templates

  const getActivationEmailParams = ({ actionId, username }) => {
    const body = compileTemplate(activationBody)({
      verificationUrl,
      appName,
      actionId,
      username
    })

    const subject = compileTemplate(activationSubject)({
      appName
    })

    return { body, subject }
  }

  const getApprovedActivationEmailParams = ({  username }) => {
    const body = 
      compileTemplate(activationBodyApproved)({
          loginUrl,
          appName,
          username
      })

    const subject = 
      compileTemplate(activationSubjectApproved)({
          appName
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
          appName,
          username
      })

    return { body, subject }
  }

  return {
    getActivationEmailParams,
    getApprovedActivationEmailParams,
    getVerifyResponseHTML,
    getNotifyAdminWhenUserCreatedParams 
  }
}
export default init