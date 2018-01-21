const fetch = require('node-fetch')
const { config } = global
const fields = 'name,email,picture'
const GoogleAuth = require('google-auth-library')

const facebook = {
  verify: (token) => (
    fetch(`https://graph.facebook.com/me?fields=${fields}&access_token=${token}`)
      .then(response => response.json())
      .then(({ id }) => (
        fetch(`https://graph.facebook.com/oauth/access_token?client_id=${config.facebook.APP_ID}&client_secret=${config.facebook.APP_SECRET}&grant_type=client_credentials`)
          .then(response => response.json())
          .then(data => (Object.assign({}, data, { userId: id })))
          .then(({ userId, access_token }) => (
            fetch(`https://graph.facebook.com/v2.9/${userId}?access_token=${token}&fields=${fields}`)
              .then(response => response.json())
          ))
      ))
  )
}

const google = {
   verify: ({ token }) => {
    const auth = new GoogleAuth()
    const client = new auth.OAuth2(config.google.clientId, '', '')
    return new Promise((resolve, reject) => (
      client
        .verifyIdToken(
          token,
          config.google.clientId,
          (e, login) => {
            resolve(login)
          }
        )
      )
    )
   }
 }


module.exports = { facebook, google }
