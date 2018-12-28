import initEntities from '../src/entities/entities-base'

const create = ({ config }) => {
  console.log('sss')
  const entities = initEntities({ config })
  return Object
    .keys(entities)
    .map((key) => {
      return entities[key]
        .sync({ force: config.force })
        .then(() => (
          console.log(`table ${key} created.`)
        ))
        .catch((err) => console.log(err))
    })
}

export default create