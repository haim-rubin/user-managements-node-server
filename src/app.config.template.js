const devConfig = {
  appName: '<Application name>',
  port: '<Port #No>',
  database: {
    name: '<Database name>',
    username: '<Database username>',
    password: '<Database password>',
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  },
  email: {
    service: '<Email service>',
    user: '<User email>',
    pass: '<User email password>',
  },
  verificationUrl: `<Domain>/api/user/verify/`,
  changePasswordUrl: `<Domain>/change-password/`,
  loginUrl: '<Domain>/login',
  tokenHash: 'any-token-key-for-jwt',

  //In case you want supports for facebook login
  //On client side when you send login request you need to send the following structure:
  // { username, password: <Facebook Token>, thirdParty:'facebook' }
  facebook: {
    APP_ID: '<Facebook app id>',
    APP_SECRET: '<App Secret>',
    VERSION: '<Graph version>' //v2.9 etc...
  },

  //In case you want supports for google login
  //On client side when you send login request you need to send the following structure:
  // { username, password: <Google Token>, thirdParty:'google' }
  google: {
    clientId: '<Google Client ID>',
    clientSecret: '<Google Client secret>',
    apiKey: '<Google Key>'
  },
  adminEmail: '<Admin email addres>'
}
export default devConfig