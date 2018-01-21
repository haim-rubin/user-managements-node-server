const entities = require('../src/entities/entities-base')

const create = ({ force }) => {
  return Object
    .keys(entities)
    .map((key) => {
      return entities[key]
        .sync({ force })
        .then(() => (
          console.log(`table ${key} created.`)
        ))
        .catch((err) => console.log(err))
    })
}

module.exports = create