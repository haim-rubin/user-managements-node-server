const init = ({ compile, activationResponse }) => (
  ({ appName, error, link }) => (
      compile(activationResponse)({
          appName,
          error,
          link
      })
  )
)
export default init