const init = ({ verificationUrl, loginUrl, appName, templates, compile }) => {

  const {
    activationBody,
    activationSubject,
    activationResponse,
    activationBodyApproved,
    activationSubjectApproved,
    notifyBodyAdminWhenUserCreated,
    notifySubjectAdminWhenUserCreated } = templates

  const getActivationEmailParams = ({ actionId, username }) => {
    const body = compile(activationBody)({
      verificationUrl,
      appName,
      actionId,
      username
    })

    const subject = compile(activationSubject)({
      appName
    })

    return { body, subject }
  }

  const getApprovedActivationEmailParams = ({  username }) => {
    const body = 
      compile(activationBodyApproved)({
          loginUrl,
          appName,
          username
      })

    const subject = 
      compile(activationSubjectApproved)({
          appName
      })

    return { body, subject }
  }

  const getVerifyResponseHTML = ({ appName, error, link }) => {
  
    const html = 
      compile(activationResponse)({
          appName,
          error,
          link
      })

    return html
  }

  const getNotifyAdminWhenUserCreatedParams = ({ username, fullName, admin }) => {
    const body =
      compile(notifyBodyAdminWhenUserCreated)({
        username,
        fullName,
        admin
      })

    const subject =
      compile(notifySubjectAdminWhenUserCreated)({
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