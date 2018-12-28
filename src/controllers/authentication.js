import  initEntities from '../entities'
import httpStatus  from 'http-status'
import jwt from 'jsonwebtoken'
import { getClientIp, getUserAgentObject } from '../services/user-agent'
import ExtError from '../utils/ExtError'
import initControllerUtil from './controllersUtils'

const init = ({ logger, config }) => {
    const isUserInRoleDB = (role) => Promise.resolve(true)
    const { onCatchUnAuthorize } = initControllerUtil({ logger })
    const { Users } = initEntities({ config: config.database })
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

export default init