import jwt from 'jsonwebtoken'

export const getToken = id => (
  Promise
    .resolve({ token: jwt.sign(id, global.config.tokenHash) })
)