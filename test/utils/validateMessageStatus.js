import expect from 'expect.js'
import { post, get, getHtml } from './fetch'
const compareResponse = (httpStatusCode, response) => ({ json, status }) => (
  new Promise((resolve, reject) => {
    try{
      expect(httpStatusCode).to.equal(status)
      if(response){
        expect(json).to.eql(response)
      }
      resolve()
    }
    catch(error){
      reject(error)
    }
  })
)

export const validatePostResponse = (url, params, httpStatusCode, response) => function(done) {
    this.timeout(10000)
    post(url, params )
      .then(compareResponse(httpStatusCode, response))
      .then(() => done())
      .catch(error => {
        console.error(error)
      })
}

export const validateGetResponse = (url, httpStatusCode, response) => function(done) {
  this.timeout(10000)
  get(url)
    .then(compareResponse(httpStatusCode, response))
    .then(() => done())
}

export const validateGetResponseStatus = (url, httpStatusCode) => function(done){
  getHtml(url)
    .then(({ status }) => {
      expect(httpStatusCode).to.equal(status)
      done()
    })
}