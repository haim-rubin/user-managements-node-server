import initEntities from '../src/entities/entities-base'

const create = ({ config }) => (
  new Promise((resolve, reject) => {
    const entities = initEntities({ config })
    return (
      Promise
        .all(
          Object
            .keys(entities)
            .map((key) => (
              entities[key]
                .sync({ force: config.force })
                .then(() => `table ${key} created.`)
            ))
        )
        .then(resolve)
        .catch(reject)
    )
  })
)

export default create