import httpStatus from 'http-status'

class HttpError extends Error {
    constructor(httpStatusCode = httpStatus.INTERNAL_SERVER_ERROR, code){
        super( code || httpStatus[httpStatusCode] )
        this.httpStatusCode = httpStatusCode
        this.code = code

        typeof Error.captureStackTrace === 'function'
            && Error.captureStackTrace(this, this.constructor)
    }    
}

export default HttpError