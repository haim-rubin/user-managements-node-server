
    const ExtError = require('../utils/ExtError')
const httpStatus = require('http-status')
const validator = require('validator')
const { writeAudit } = require('./audit')
const logger = require('../utils/getLogger')('app')

const onCatchLog = (error) => {
    const { code, messageAll: message, list: messages } = error

    logger
        .error(`message: ${message}, code: ${code}`)
}

const onCatchResponse = (error, res) => {
    const { code, messageAll: message, list: messages } = error

    res
        .status(code || httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message, messages })
}

const onCatch = (error, res) => {
    onCatchLog(error)
    onCatchResponse(error, res)
}

const onCatchUnAuthorize = (error, res) => {
    onCatchLog(error)
    onCatchResponse({
        code: httpStatus.UNAUTHORIZED,
        messageAll: httpStatus[httpStatus.UNAUTHORIZED]
    }, res)
}

const isValidUserInput = ({ body, headers, query }) => {
    const { username } = body
    return Promise.resolve(
        username && validator.isEmail(username || '') || validator.isLength(headers.token || query.token || query.actionId, { min: 6 })
    )
}

const validateInput = (req, res, next) => {
    isValidUserInput(req)
        .then(isValid => {
            if(!isValid){
                throw new ExtError('Invalid username / token / actionId', httpStatus.BAD_REQUEST)
            }
            return isValid
        })
        .then(() => next())
        .catch((error) => {
            onCatch(error, res)
        })
}

const writeAuditAndNext = (req, res, next) => {
    writeAudit(req)
        .then((response) => (
            next()
            )
        )
        .catch((error) => {
            onCatch(error, res)
        })
}

module.exports = {
    onCatch,
    validateInput,
    writeAuditAndNext,
    onCatchLog,
    onCatchResponse,
    onCatchUnAuthorize
}
