const { Audit, Users, ActionVerifications } = require('../entities')
const { config } = global
const ExtError = require('../utils/ExtError')
const httpStatus = require('http-status')

const cleanBody = ({ password, retypePassword, ...cleanedBody }) => (
    cleanedBody
)

const getAuditParams = ({ body, originalUrl, query, params }) => (
    Object
        .assign(
            {},
            body,
            { actionName: originalUrl,
              requestParams: JSON.stringify(
                Object
                    .assign(
                        {},
                        {
                            body: 
                                Object
                                    .assign(
                                        {}, 
                                        cleanBody(body)
                                    ),
                            query,
                            params
                        }
                    )
                ) 
            }      
        )
)

const getToken = ({ headers, query }) => (
    headers.token || query.token
)

const getWithUsername = ({ body, headers, query }) => (
    
        body.username?

            Promise.resolve(body) :

            getToken({ headers, query })?

                Users
                    .findOne(
                        {
                            where: { token:  getToken({ headers, query }) }
                        }
                    )
                    .then((user) => {
                        if(!user || (user && !user.username)){
                            throw new ExtError('User not identified', httpStatus.UNAUTHORIZED)
                        }
                        return user
                    })
                    .then((user) => (
                        Object.assign({}, body, { username: user.username })
                        )
                    ) :

                    ActionVerification
                        .findOne(
                            {
                                where: { actionId: query.actionId, deleted: false } 
                            }
                        )
    )
  

const writeAudit = (req) => (
    getWithUsername(req)
        .then((body) => (
            Audit
                .create(
                    getAuditParams(
                        {
                            body,
                            originalUrl: req.originalUrl,
                            query: req.query,
                            params: req.params
                        }   
                    )
            ))
        )          
    )

module.exports = { writeAudit }