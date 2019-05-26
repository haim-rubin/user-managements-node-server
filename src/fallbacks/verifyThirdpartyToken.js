import fetch from 'node-fetch'
import { GoogleAuth } from 'google-auth-library'
const fields = 'name,email,picture'

const init3rdPartyProviders = ({ config }) =>({

  facebook: {
    verify: ({ token }) => (
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
        .then(userInfo => ({
          ...userInfo,
          isValid: userInfo.email === username,
          profilePhoto: userInfo.picture && userInfo.picture.data.url
        }))
    )
  },

  google: {
    verify: ({ token }) => {
      const client = new (new GoogleAuth()).OAuth2(config.google.clientId, '', '')
      return (
        new Promise((resolve, reject) => (
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
        .then((login) => login.getPayload())
        .then(userInfo => ({
          ...userInfo,
          isValid: userInfo.email === username,
          profilePhoto: userInfo.picture
        }))
      )
    }
  }
})

export default init3rdPartyProviders