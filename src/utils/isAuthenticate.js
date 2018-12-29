import fetch from 'node-fetch'
import httpStatus from 'http-status'
import { getClientIp, getUserAgentObject } from './user-agent'


const isAuthenticated = (role) => (
    (req, res, next) => (
        validateAuthenticated(req.headers.token, role)
        .then(() => {
            next()
        })
    )
)

const isAuthenticate = (endpoint) => (
    (req, res, next) => {
        const { headers , body } = req
    
        return fetch(
            endpoint,
            {
                headers, 
                method: 'POST', 
                body 
            }
        )
        .then((response) => {
           return response.json()
        })
        .then((body) => {
            res
                .json(body)
        })
        .catch((error) => {
            throw error
        })
    }
)

export default isAuthenticate