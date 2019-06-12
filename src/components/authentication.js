import  initEntities from '../entities'
import httpStatus  from 'http-status'
import jwt from 'jsonwebtoken'
import HttpError from "../utils/HttpError";
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
    const { Users, Tokens } = initEntities({ config: config.database })
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
                Tokens
                    .findOne({ where: { token } })
                    .then((tokenInfo) => {
                        if (!tokenInfo) {
                            throw `User doesn't not exist { token: ${token}} `
                        }
                        return tokenInfo
                    })
                    .then(extract)
                    .then(tokenInfo => {
                        return Users
                            .findOne({ where: { id: tokenInfo.userId }})
                            .then(extract)
                            .then((user) => {
                                if(user && user.isValid) {
                                    return user
                                }
                                throw `User with token ${token} not found`
                            })
                    })
            ))
    )

    const throwIfTokenNotSupplied = token => (
        !!token
        ? Promise.resolve({token})
        : Promise.reject({token})
    )

    const validateAuthenticated = (token, role) => (
        throwIfTokenNotSupplied(token)
            .then(innerIsAuthenticated)
            .then(info => (
                role
                ? isUserInRole(role).then(() => info)
                : info
            ))
            .then(user => {
                if(!user.id){
                    throw `User doesn't not exist`
                }
                return user
            })
            .catch((error) => {
                logger.error(error)
                throw  new HttpError(httpStatus.UNAUTHORIZED)
            })
    )

    const isAuthenticated = ({ token, role }) => (
        validateAuthenticated(token, role)
            .then(({ id, username }) => ({
                username,
                id
            }))
    )

    return {
        validateAuthenticated,
        isAuthenticated
    }
}

export default init