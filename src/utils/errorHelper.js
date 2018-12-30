import HttpError from './HttpError'
import httpStatus from 'http-status'
export const getDefaultErrorIfNotSupplied = (error, defaultHttpStatusCode = httpStatus.INTERNAL_SERVER_ERROR)  => (
    !(error instanceof HttpError)
    ? new HttpError(defaultHttpStatusCode)
    : error   
)