import jwt from 'jsonwebtoken'

export const getToken = (id, tokenHash) => (
  Promise
    .resolve({ token: jwt.sign(id, tokenHash) })
)