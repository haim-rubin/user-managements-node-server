import { getClientIp, getUserAgentObject } from '../utils/user-agent'
import httpStatus from 'http-status'
import { getDefaultErrorIfNotSupplied } from '../utils/errorHelper'

const init = ({ isAuthenticated, logger }) => {

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
            ...getUserAgentObject(req),
            ip: getClientIp(req)
        }
    })

    const logHttpRequest = log => (
        (req, _, next) => {
            const { clientInfo } = req
            const { userInfo } = req
            const { body: { password, ...body }, params, query, method } = req

            log({
                originalUrl: req.originalUrl,
                method,
                clientInfo,
                ...(userInfo? { userInfo } : {}),
                ...{ body, params, query }
            })

            next()
        }
    )

    return{
        unauthorizedIfNotAuthenticated,
        responseError,
        getClientInfo,
        responseOk,
        logHttpRequest
    }
}
export default init