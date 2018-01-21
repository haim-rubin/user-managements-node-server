const sequelize = require('sequelize')

const upsert = (entity, record, condition) => (
  entity
    .findOne(condition)
    .then((dbRecord) => (
      dbRecord ?
        dbRecord.update(record) :
        entity.create(record)
    ))
)

const upsertBulk = (list, entity, conditionCallback) => (
  Promise
    .all(
    list
      .map((record) => (
        upsert(entity, record, conditionCallback(record))
      ))
    )
)

const { Op } = sequelize

const isNull = { $eq: null }

const valueOrIsNull =
  (value) => value ? value : isNull

const extractObject = (obj) => obj.dataValues

const extract = (results) => (
  results? 
    Array.isArray(results)? results.map(extractObject): extractObject(results)
    : results
)

module.exports = { upsert, isNull, upsertBulk, valueOrIsNull, extract }