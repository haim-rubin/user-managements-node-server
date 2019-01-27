const init = ({ compile }) => (
  ({ appName, error, link }) => (
      compile(activationResponse)({
          appName,
          error,
          link
      })
  )
)
export default init