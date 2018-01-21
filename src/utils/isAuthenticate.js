const fetch = require('node-fetch')
const httpStatus = require('http-status')

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

module.exports = isAuthenticate