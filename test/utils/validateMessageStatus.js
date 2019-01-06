import httpStatus from 'http-status'
import expect from 'expect.js'
import { get, post } from './fetch'

const compareResponse = (httpStatusCode, response) => ({ json, status }) => (
  new Promise(resolve => {
    expect(httpStatusCode).to.equal(status)
    expect(json).to.eql(response)
    resolve()
  })
)

export const validatePostResponse = (url, params, httpStatusCode, response) => function(done) {
    this.timeout(10000)
    post(url, params )
      .then(compareResponse(httpStatusCode, response))
      .then(() => done())
}

export const validateGetResponse = (url, httpStatusCode, response) => function(done) {
  this.timeout(10000)
  get(url)
    .then(compareResponse(httpStatusCode, response))
    .then(() => done())
}
