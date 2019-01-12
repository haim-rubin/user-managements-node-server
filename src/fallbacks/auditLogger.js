const getFriendlyLogObject = obj => (
    Object
      .entries(obj)
      .map(([key, value]) =>(
        `${key}: ${value}`
      ))
      .join(',')
  )

  const getFriendlyLogObjectIfHasKeys = (obj, key) => (
    Object
      .keys(obj).length
    ? `${key}: { ${getFriendlyLogObject(obj) } }`
    : ''
  )

const auditLogger = logger => ({
    body,
    clientInfo: { ip },
    originalUrl,
    params,
    query }) => {

    const friendlyObjInfo = [
      getFriendlyLogObjectIfHasKeys(body, 'body'),
      getFriendlyLogObjectIfHasKeys(params, 'params'),
      getFriendlyLogObjectIfHasKeys(query, 'query')
    ]
    .filter(x => x)
    .join(', ')

    logger.info(
      `${originalUrl}: { ip: ${ip}, ${ friendlyObjInfo} }`
    )
}

export default auditLogger