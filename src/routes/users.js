const init = ({
  signUp,
  signIn,
  signOut,
  forgotPassword,
  changePassword,
  verify,
  getUserInfo,
  isAuthenticated,
  handleAuthenticated
}) => (userRoute) => {
    
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
  
export default init
