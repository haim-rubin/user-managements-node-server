const userRoute = '/user'
const config = {
  // if this flag is true the admin user will get verification email instead of the user
  verifyUserByAdmin: true,  
  appName:'Application Name',
  userRoute,
  port: 5300,
  database: {
    name: 'user-managements-db-name',
    username: 'user-managements-db-username',
    password: 'user-managements-db-password',
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    logging: false
  },
  email: {
    service: 'gmail',
    user: 'support-email@gmail.com',
    pass: 'support-email-password',
    from: '"Support" <support-email@gmail.com>'
  },
  verificationUrl: `http://localhost:5300${userRoute}/verify/`, // Web client UI
  changePasswordUrl: `http://localhost:3000/change-password/`, // Web client UI
  loginUrl: 'http://localhost:3000', // Web client UI
  tokenHash: 'token-key', // replace with realy token
  adminEmail: 'support-email@gmail.com',
  log4js: {
    appenders: { app: { type: 'file', filename: '/tmp/logs/app-name.log' } },
    categories: { default: { appenders: ['app'], level: 'all' } }
  },
  facebook: {
    APP_ID: 123456789,
    APP_SECRET: 'app-secret',
    VERSION: 'v2.9'
  }, 
  google: {
    clientId: 'clientId',
    clientSecret: 'clientSecret',
    apiKey: 'apiKey'
  },
  loginWithThirdParty: true, // true is for supporting login via Facebook/Google
  templates: {
    activationBody : '../email-templates/activation/body.html',
    activationSubject : '../email-templates/activation/subject.html',
    activationResponse : '../email-templates/activation/response.html',
    activationBodyApproved : '../email-templates/approved-activation/body.html',
    activationSubjectApproved : '../email-templates/approved-activation/subject.html',
    notifyBodyAdminWhenUserCreated : '../email-templates/notify-admin-when-user-created/body.html',
    notifySubjectAdminWhenUserCreated : '../email-templates/notify-admin-when-user-created/subject.html'
  }
}

module.exports = config