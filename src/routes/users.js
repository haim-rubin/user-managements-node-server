import HttpError from "../utils/HttpError";

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

    userRoute
      .route('/sign-up')
      .post((req, res) => {
        const { username, password } = req.body
        signUp({ username, password })
          .then(({ code, message }) => {
            res
              .status(code)
              .json({ message })
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

    userRoute
      .route('/sign-in')
      .post(signIn)

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
