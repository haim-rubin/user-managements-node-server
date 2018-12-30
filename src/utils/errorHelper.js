import HttpError from './HttpError'
export const getDefaultErrorIfNotSupplied = error => (
    !(error instanceof HttpError)
    ? new HttpError()
    : error   
)