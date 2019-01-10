import { getClientIp, getUserAgentObject } from '../utils/user-agent'
import httpStatus from 'http-status'
import { getDefaultErrorIfNotSupplied } from '../utils/errorHelper'

const init = ({ isAuthenticated }) => {

    const response = ({ res, httpStatusCode, data }) => {
        res
            .status(httpStatusCode)
            .json(data || { message: httpStatus[httpStatusCode] })
    }

    const responseOk = res => ({ httpStatusCode = httpStatus.OK, ...data }) => {
        response({ res, httpStatusCode, data })
    }

    const responseError = (res, defaultHttpStatusCode) => error => {
        response({
        res,
        ...getDefaultErrorIfNotSupplied(error, defaultHttpStatusCode)
        })
    }

    const unauthorizedIfNotAuthenticated = (role) => (
        (req, res, next) => (
            isAuthenticated({ token: req.headers.token, role })
                .then((userInfo) => {
                    Object
                        .assign(req, { userInfo })
                    next()
                })
                .catch(responseError(res,httpStatus.UNAUTHORIZED))
        )
    )

    const getClientInfo = (req) => ({
        clientInfo: {
            ip: getClientIp(req),
            userAgen: getUserAgentObject(req)
        }
    })

    return{
        unauthorizedIfNotAuthenticated,
        responseError,
        getClientInfo,
        responseOk
    }
}
export default init