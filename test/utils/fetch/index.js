import innerFetch from 'node-fetch'

const fetch = ({ endpoint, body, headers = {} , method }) => (
    innerFetch(
      endpoint, {
        method,
        headers:{
          ...headers
        },
        ...(method === 'POST'? { body: JSON.stringify(body) } : {})
      }
    )
  )
  .catch((error) => {
    throw error
  })

export const get = (endpoint, headers) => (
  fetch({ endpoint, headers: {
    ...headers,
    'Content-type':'application/json',
  }, method: 'GET'})
    .then(async response => ({
      json: await response.json(),
      status: response.status
    }))
)

export const post = (endpoint, body, headers) => (
  fetch({ endpoint, headers: {
    ...headers,
    'Content-type':'application/json',
  }, body, method: 'POST'})
    .then(async response => ({
      json: await response.json(),
      status: response.status
    }))
)


export const getHtml = (endpoint, headers) => (
  fetch({ endpoint, headers: {
    ...headers,
    'Content-type':'text/html; charset=utf-8',
  }, method: 'GET'})
    .then(async response => ({
      html: await response.text(),
      status: response.status
    }))
)