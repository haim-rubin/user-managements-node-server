import { getClientIp, getUserAgentObject } from '../utils/user-agent'
import httpStatus from 'http-status'
import { getDefaultErrorIfNotSupplied } from '../utils/errorHelper'

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

const response = ({ res, httpStatusCode, data }) => {
    res
      .status(httpStatusCode)
      .json(data || { message: httpStatus[httpStatusCode] })
}

export const responseOk = res => ({ httpStatusCode = httpStatus.OK, ...data }) => {
    response({ res, httpStatusCode, data })
}

export const responseError = (res, defaultHttpStatusCode) => error => {
    response({
      res,
      ...getDefaultErrorIfNotSupplied(error, defaultHttpStatusCode)
    })
}

export const isAuthenticated = (role) => (
    (req, _, next) => (
        validateAuthenticated(req.headers.token, role)
          .then(({ id, username }) => setRequestWithUserInfo({ username, id, req }))
          .then(() => {
              next()
          })
    )
)