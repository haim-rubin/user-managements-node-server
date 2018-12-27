export const isNull = { $eq: null }

export const valueOrIsNull =
  (value) => value ? value : isNull

export const extractObject = (obj) => obj.dataValues

export const extract = (results) => (
  results? 
    Array.isArray(results)? results.map(extractObject): extractObject(results)
    : results
)