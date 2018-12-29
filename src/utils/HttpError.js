import httpStatus from 'http-status'

class HttpError extends Error {
    constructor(code = httpStatus.INTERNAL_SERVER_ERROR, message){
        super( message || httpStatus[code] )
        this.code = code
        this.messages =
            message
            && [message, httpStatus[code]]

        typeof Error.captureStackTrace === 'function'
            && Error.captureStackTrace(this, this.constructor)
    }    
}

export default HttpError