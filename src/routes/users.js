import initAuthntication from '../controllers/authentication'
import initUsersController from '../controllers/users'
const init = ({ config, logger, _3rdPartyProviders}) => {
  const {
    signUp,
    signIn,
    signOut,
    forgotPassword,
    changePassword,
    verify,
    getUserInfo 
  } = initUsersController({ config, logger, _3rdPartyProviders })

  const { isAuthenticated, handleAuthenticated } = initAuthntication({ logger, config })

  const setupRoutes = (userRoute) => {
    
    userRoute
      .route('/sign-up')
      .post(signUp)

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
      .route('/is-authenticate')
      .post((req, res, next) => {
        const { body: { role } } = req
        return handleAuthenticated(req, res, next, role)
      })
  }
  return setupRoutes
}
export default init
