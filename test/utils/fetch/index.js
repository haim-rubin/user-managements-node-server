import innerFetch from 'node-fetch'

const fetch = ({ endpoint, body, headers = {} , method }) => (
    innerFetch(
      endpoint,
      Object
        .assign({},
          {
            method
          },
          {
            headers: Object.assign(
              {
                "Content-type":'application/json'
              },
              headers
            )
          },
          method === 'POST'? { body: JSON.stringify(body) } : {}
      )
    )
    .then(async response => ({
        json: await response.json(),
        status: response.status
      }
    ))
    .catch((error) => {
      throw error
    }))

export const get = (endpoint, headers) => (
  fetch({ endpoint, headers, method: 'GET'})
)

export const post = (endpoint, body, headers) => (
  fetch({ endpoint, headers, body, method: 'POST'})
)