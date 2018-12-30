import HttpError from "../utils/HttpError";
import { getDefaultErrorIfNotSupplied } from '../utils/errorHelper'
const init = ({
  signUp,
  signIn,
  signOut,
  forgotPassword,
  changePassword,
  verify,
  getUserInfo,
  isAuthenticated,
  validateAuthenticated
}) => (userRoute) => {

  const responseError = res => error => {
    const { httpStatusCode, message } =
      getDefaultErrorIfNotSupplied(error)

      res
        .status(httpStatusCode)
        .json({ message })
  }

  const setRequestWithUserInfo = ({ req, username, id }) => {
    Object
        .assign(
            req, 
            { userInfo: {
                id,
                username
                }
            },
            { 
                clientInfo: {
                    ip: getClientIp(req),
                    userAgen: getUserAgentObject(req)
                    }
            }
        )

    return { id }
}
//.then(({ id, username }) => setRequestWithUserInfo({ username, id, req }))

const isAuthenticated = (role) => (
  (req, res, next) => (
      validateAuthenticated(req.headers.token, role)
      .then(() => {
          next()
      })
  )
)

    userRoute
      .route('/sign-up')
      .post((req, res) => {
        const { username, password } = req.body
        signUp({ username, password })
          .then(({ httpStatusCode, message }) => {
            res
              .status(httpStatusCode)
              .json({ message })
          })
          .catch(responseError(res))
      })

    userRoute
      .route('/sign-in')
      .post((req, res) => {
        const { username, password, thirdParty } = req.body
        signIn({ username, password, thirdParty })
          .then(payload =>{
            res
              .json(payload)
          })
          .catch(responseError(res))
      })

    userRoute
      .route('/sign-out')
      .post(isAuthenticated(), signOut)

    userRoute
      .route('/forgot-password')
      .post(forgotPassword)

    userRoute
      .route('/change-password')
      .post(changePassword)

    userRoute
      .route('/verify/:actionId')
      .get(verify)
    
    userRoute
      .route('/info')
      .get(isAuthenticated(), getUserInfo)

    userRoute
      .route('/contact-us')
      .post(isAuthenticated(), (req, res) => {
        const { subject, description } = req.body
          .sendContactUs({username: req.username, subject, description })
          .then((info) => {
            res.json({ message: 'Email request sent'})
          })
      })

    userRoute
      .route('/is-authenticated')
      .post((req, res, next) => {
        const {
          body: { role },
          headers: { token }
        } = req

        validateAuthenticated(token, role)
          .then(() => {
            next(req.userInfo)
          })
          .catch(error => {
            if(!(error instanceof HttpError)){
              error = new HttpError()
            }

            res
                .status(error.code)
                .json(error.message)
          })
      })
  }

export default init
