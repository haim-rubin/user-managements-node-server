import httpStatus from 'http-status'

class HttpError extends Error {
    constructor(code = httpStatus.INTERNAL_SERVER_ERROR){
        super(httpStatus[code])
        this.code = code
        typeof Error.captureStackTrace === 'function' &&
            Error.captureStackTrace(this, this.constructor)
    }    
}

export default HttpError