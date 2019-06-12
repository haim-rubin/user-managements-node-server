import HttpError from "../utils/HttpError";
import httpStatus from 'http-status'
import initRouteHelper from './routeHelper'
import crypto from 'crypto'
import querystring from 'querystring'
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
  isAuthenticated,
  auditLogger,
  userRoutePrefix
}) => (userRouter, app) => {

  const {
    unauthorizedIfNotAuthenticated,
    responseError,
    getClientInfo,
    responseOk,
    logHttpRequest
  } = initRouteHelper({ isAuthenticated })

  const enrichWithClientInfo = (req, _, next) => {
    Object
      .assign(req, getClientInfo(req))
    next()
  }

  const getUserAgentUniqueIdentify = (userAgentInfo) => {
    return new Promise((resolve, reject) => {
      try {
        const hash =
          crypto.createHash('sha256')

        resolve(
          hash
            .update(
              querystring
                .stringify(userAgentInfo)
            )
            .digest('hex')
        )
      }
      catch(error){
        reject(error)
      }
    })
  }

  app.use(enrichWithClientInfo)
  app.use(userRoutePrefix, userRouter)

  const logHttpRequestWrapper =
    logHttpRequest(auditLogger)

  userRouter
    .route('/sign-up')
    .post(
      logHttpRequestWrapper,
      (req, res) => {
        const { username, password } = req.body
        signUp({ username, password })
          .then(responseOk(res))
          .catch(responseError(res))
      })

  userRouter
    .route('/sign-in')
    .post(
      logHttpRequestWrapper,
      (req, res) => {
        const { username, password, thirdParty } = req.body
        const { clientInfo } = req

        getUserAgentUniqueIdentify({
          ...clientInfo,
          username
        })
        .then(userAgentIdentity => (
          signIn({ username, password, thirdParty, clientInfo, userAgentIdentity })
          .then(responseOk(res))
        ))
        .catch(responseError(res, httpStatus.UNAUTHORIZED))

      })

  userRouter
    .route('/sign-out')
    .post(
      unauthorizedIfNotAuthenticated(),
      logHttpRequestWrapper,
      (req, res) => {
        const { userInfo, clientInfo } = req

        getUserAgentUniqueIdentify({
          ...clientInfo,
          username: userInfo.username
        })
        .then(userAgentIdentity => (
          signOut({ ...userInfo, userAgentIdentity })
          .then(responseOk(res))
        ))
        .catch(responseError(res))
      }
    )

  userRouter
    .route('/forgot-password')
    .post(
      logHttpRequestWrapper,
      (req, res) =>{
        const { username } = req.body
        forgotPassword({ username })
          .then(responseOk(res))
          .catch(error => {
            console.log(error)
            throw error
          })
          .catch(responseError(res))
      })

  userRouter
    .route('/change-password/:actionId')
    .post(
      logHttpRequestWrapper,
      (req, res) => {
        const { actionId } = req.params
        const { password, confirmPassword } = req.body

        changePassword({ actionId, password, confirmPassword })
          .then(({ httpStatusCode, message }) => {
            res
              .status(httpStatusCode)
              .json({ message })
          })
          .catch(error =>{
            res
            .status(error.httpStatusCode)
            .json({ message: error.code })
          })
      })

  userRouter
    .route('/verify/:actionId')
    .get(
      logHttpRequestWrapper,
      (req, res) => {
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

  userRouter
    .route('/info')
    .get(
      unauthorizedIfNotAuthenticated(),
      logHttpRequestWrapper,
      (req, res) => {
        getUserInfo(req.userInfo)
          .then(userInfo => {

            res
              .json(userInfo)

          })
          .catch(responseError(res, httpStatus.BAD_REQUEST))
      })

  userRouter
    .route('/contact-us')
    .post(
      unauthorizedIfNotAuthenticated(),
      logHttpRequestWrapper,
      (req, res) => {
        const { subject, description } = req.body
          .sendContactUs({username: req.username, subject, description })
          .then((info) => {
            res.json({ message: 'Email request sent'})
          })
      })

  userRouter
    .route('/is-authenticated')
    .post(
      logHttpRequestWrapper,
      (req, res, next) => {
        const {
          body: { role },
          headers: { token }
        } = req

        validateAuthenticated(token, role)
          .then(() => {
            next()
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