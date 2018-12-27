const init = ({ logger }) => {
    const { Users } = require('../entities')
    const httpStatus = require('http-status')
    const jwt = require('jsonwebtoken')
    const { config } = global
    const { getClientIp, getUserAgentObject } = require('../services/user-agent')
    const ExtError = require('../utils/ExtError')
    const isUserInRoleDB = (role) => Promise.resolve(true)
    const { onCatchUnAuthorize } = require('./controllersUtils')({ logger })

    const isUserInRole = ({ username, role }) => (
    //TODO: check if user is in role duo to database, if it does so return username if not return null
        isUserInRoleDB(username, role)
            .then(() => {
                resolve({ username })
            })
            .catch(() => {
                reject(new ExtError(`User is not in role (${role}`, httpStatus.UNAUTHORIZED))
            })
    )

    const innerIsAuthenticated = ({ token }) => (
        new Promise((resolve, reject) => {
            jwt.verify(token, config.tokenHash, (err, decoded) => {
                return err ?
                    reject(new ExtError(err.message, httpStatus.UNAUTHORIZED)) :
                    Users
                        .findOne({ where: { token } })
                        .then((response) => {
                            if (!response) {
                                throw new ExtError('User not exist', httpStatus.UNAUTHORIZED)
                            }
                            return response
                        })
                        .then(({ dataValues: user }) => user && user.token === token ? resolve(user) : reject(null))
                        .catch((error) => {
                            reject(error)
                        })

            })
        })
    )

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

    const validateAuthenticated = (req, res, next, role) => (
        innerIsAuthenticated({ token: req.headers.token })
            .then(info => (
                role?
                isUserInRole(role)
                    .then(() => info) :
                info
            ))
            .then(({ id, username }) => setRequestWithUserInfo({ username, id, req }))
            .then(({ id }) => {
                if(!id){
                    throw new ExtError('User not exist', httpStatus.UNAUTHORIZED)
                }
                return { id }
            })
            .catch((error) => {
                onCatchUnAuthorize(error, res)
            })
    )

    const handleAuthenticated = (req, res, next, role) => (
        validateAuthenticated(req, res, next, role)
            .then(({ id }) => {
                res
                    .json(req.userInfo)
            })
    )

    const isAuthenticated = (role) => (
        (req, res, next) => (
            validateAuthenticated(req, res, next, role)
            .then(({ id }) => {
                next()
            })
        )
    )

    return {
        handleAuthenticated,
        isAuthenticated
    }
}

module.exports =  init