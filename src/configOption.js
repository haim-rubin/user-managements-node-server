const config = {
    /* if this flag is true the admin user will get verification email instead of the user */
    verifyUserByAdmin: false, 
    appName: 'Node User managemens server',
    port: 5300,
    database: {
      name: '<Database name>',
      username: '<Database username>',
      password: '<Database password>',
      host: '<Database host>',
      dialect: '<Database type>',
      pool: {
        max: 5,
        min: 0,
        idle: 10000
      }
    },
    email: {
        service: '<Email Service>',
        user: '<Email Username>',
        pass: '<Email Password>',
        from: '<Email From>'
    },
    verificationUrl: `<Verify User URL>`,
    changePasswordUrl: `<Change Password URL>`,
    loginUrl: '<Login URL>',
    tokenHash: '<Token Hash Key>',
    adminEmail: '<Admin Email>',
    log4js: {
      appenders: { app: { type: 'file', filename: '/Users/haimr-mac/logs/app-name.log' } },
      categories: { default: { appenders: ['app'], level: 'all' } }
    },
    facebook: {
      APP_ID: '<Facebook App ID>',
      APP_SECRET: '<Facebook App Secret>',
      VERSION: 'v2.9'
    }, 
    google: {
      clientId: '<Google Client ID>',
      clientSecret: '<Google Client Secret>',
      apiKey: '<Google Api Key>'
    },
    loginWithThirdParty: true,
    templates: {
      activationBody : '../email-templates/activation/body.html',
      activationSubject : '../email-templates/activation/subject.html',
      activationResponse : '../email-templates/activation/response.html',
      activationBodyApproved : '../email-templates/approved-activation/body.html',
      activationSubjectApproved : '../email-templates/approved-activation/subject.html',
      notifyBodyAdminWhenUserCreated : '../email-templates/notify-admin-when-user-created/body.html',
      notifySubjectAdminWhenUserCreated : '../email-templates/notify-admin-when-user-created/subject.html'
    },
    userRoute: '/user'
  }
  
  module.exports = config