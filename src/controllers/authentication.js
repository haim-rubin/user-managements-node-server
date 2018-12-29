import  initEntities from '../entities'
import httpStatus  from 'http-status'
import jwt from 'jsonwebtoken'
import { getClientIp, getUserAgentObject } from '../services/user-agent'
import HttpError from "../utils/HttpError";
import initControllerUtil from './controllersUtils'
import { extract } from '../utils/SequelizeHelper'
const jwtVerify = (token, secretOrPublicKey) => (
    new Promise((resolve, reject) => {
        jwt.verify(token, secretOrPublicKey, ( err, decoded) => {
            err? reject(err) : resolve(decoded)
        })
    })
)

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
                logger.error(`User is not in role (${role}`)
                reject(new HttpError( httpStatus.UNAUTHORIZED))
            })
    )

    const innerIsAuthenticated = ({ token }) => (
        jwtVerify(token, config.tokenHash)
            .then(() => (
                Users
                    .findOne({ where: { token } })
                    .then((user) => {
                        if (!user) {
                            throw `User doesn't not exist { token: ${token}} `
                        }
                        return user
                    })
                    .then(extract)
                    .then(user => {
                        if(!user || user.token !== token){
                            throw `User with token ${token} not found`
                        }
                        return user
                    })
            ))
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

    const validateAuthenticated = (token, role) => (
        innerIsAuthenticated({ token })
            .then(info => (
                role
                ? isUserInRole(role).then(() => info)
                : info
            ))
            .then(user => {
                if(!user.id){
                    throw 'User not exist'
                }
                return user
            })
            .catch((error) => {
                logger.error(error)
                throw  new HttpError(httpStatus.UNAUTHORIZED)
            })
    )

    //.then(({ id, username }) => setRequestWithUserInfo({ username, id, req }))

    const isAuthenticated = (role) => (
        (req, res, next) => (
            validateAuthenticated(req.headers.token, res, role)
            .then(() => {
                next()
            })
        )
    )

    return {
        validateAuthenticated,
        isAuthenticated
    }
}

export default init