import HttpError from "../utils/HttpError";
import httpStatus from 'http-status'
import initRouteHelper from './routeHelper'
import path from 'path'
const init = ({
  signUp,
  signIn,
  signOut,
  forgotPassword,
  changePassword,
  verify,
  getUserInfo,
  validateAuthenticated,
  getVerifyResponseHTML,
  isAuthenticated
}) => (userRoute) => {

  const {
    unauthorizedIfNotAuthenticated,
    responseError,
    getClientInfo,
    responseOk
  } = initRouteHelper({ isAuthenticated })

  userRoute
    .route('/sign-up')
    .post((req, res) => {
      const { username, password } = req.body
      signUp({ username, password })
        .then(responseOk(res))
        .catch(responseError(res))
    })

  userRoute
    .route('/sign-in')
    .post((req, res) => {
      const { username, password, thirdParty } = req.body
      signIn({ username, password, thirdParty })
        .then(responseOk(res))
        .catch(responseError(res, httpStatus.UNAUTHORIZED))
    })

  userRoute
    .route('/sign-out')
    .post(unauthorizedIfNotAuthenticated(), (req, res) => {
      const { userInfo } = req
      signOut(userInfo)
        .then(responseOk(res))
        .catch(err =>{
          return err
        })
        .catch(responseError(res))
    })

  userRoute
    .route('/forgot-password')
    .post((req, res) =>{
      const { username } = req.body
      forgotPassword({ username })
        .then(responseOk(res))
        .catch(error => {
          console.log(error)
          throw error
        })
        .catch(responseError(res))
    })

  userRoute
    .route('/change-password')
    .post((req, res) => {
      const { actionId } = req.params
      const { password, confirmPassword } = req.body

      changePassword({ actionId, password, confirmPassword })
        .then(({ httpStatusCode, message }) => {
          res
            .status(httpStatusCode)
            .json({ message })
        })
    })

  userRoute
    .route('/verify/:actionId')
    .get((req, res) => {
      const { actionId } = req.params
      verify({ actionId })
        .then(() => {
          res
            .end(
              getVerifyResponseHTML(false)
            )
        })
        .catch(error => {
          res
            .status(error.httpStatusCode)
            .end(getVerifyResponseHTML(true))
        })
    })

  userRoute
    .route('/info')
    .get(unauthorizedIfNotAuthenticated(), (req, res) => {
      getUserInfo(req.userInfo)
        .then(userInfo => {

          res
            .json(userInfo)

        })
        .catch(responseError(res, httpStatus.BAD_REQUEST))
    })

  userRoute
    .route('/contact-us')
    .post(unauthorizedIfNotAuthenticated(), (req, res) => {
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
