const innerFetch = require('node-fetch')

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
    .then((response) => response.json())
    .catch((error) => {
      throw error
    }))
  
    const get = (endpoint, headers) => (
        fetch({ endpoint, headers, method: 'GET'})
      )

    const post = (endpoint, body, headers) => (
        fetch({ endpoint, headers, body, method: 'POST'})
      )


module.exports = {
    post,
    get
}
