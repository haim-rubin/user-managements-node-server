const CONSTANTS = require('../consts')
const loginViaFacebook = ({ username, token }) => (
  facebook
    .verify(token)
    .then(userData => Object.assign({}, userData, { isValid: userData.email === username, profilePhoto: userData.picture && userData.picture.data.url }))
)

const loginViaGoogle = ({ username, token }) => (
  google
    .verify({ token })
    .then((login) => login.getPayload())
    .then((userInfo) => (
      Object
        .assign(
        {},
        userInfo,
        {
          isValid: userInfo.email === username,
          profilePhoto: userInfo.picture
        }
        )
    )
    )
)

const loginViaThirdPartyMapper = {
  [CONSTANTS.THIRDPARTY.FACEBOOK]: loginViaFacebook,
  [CONSTANTS.THIRDPARTY.GOOGLE]: loginViaGoogle
}

const signUpThirdPartyUser = ({ thirdParty, isValid, password, id, email: username, profilePhoto }) => (
  User.findOne({ username })
    .then(user => (
      user ?

        updateUser({ [thirdPartyProp[thirdParty]]: password, profilePhoto }, { username })
          .then(arrEffected => !!arrEffected[0])
          .then(effected => effected && getUser({ username })) :

        create({ username, password, [thirdPartyProp[thirdParty]]: password, profilePhoto })
    )
    )
)

const loginVia3rdparty = ({ username, password: token, thirdParty }) => (
  loginViaThirdPartyMapper[thirdParty] ?
    loginViaThirdPartyMapper[thirdParty]({ username, token })
      .then(user => {
        return user.isValid ?
          signUpThirdPartyUser(Object.assign({}, user, { thirdParty, password: token })) :
          Promise.resolve(null)
      }) :
    Promise.resolve(null)
)

module.exports = {
  loginVia3rdparty
}