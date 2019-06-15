import crypto  from 'crypto'
import { promisify } from 'util'
const scrypt = promisify(crypto.scrypt)
const numBase = 'hex'
const keyLength = 64

export const randomBytes = promisify(crypto.randomBytes)

export const randomBytesHex = keyLength => (
    randomBytes(keyLength)
        .then(bytes => bytes.toString(numBase))
)
export const encrypt = ({ clearPassword, salt, length = keyLength }) => (
    scrypt(clearPassword, salt, length)
        .then(derivedKey => derivedKey.toString(numBase))
)

export const verifyPassword = ({ password, encryptedPassword, salt }) => (
    scrypt(password, salt, keyLength)
        .then(derivedKey => derivedKey.equals(Buffer.from(encryptedPassword, numBase)))
        .then(isMatch => {
            if(!isMatch){
                throw new Error(`Passwords not matched`)
            }
            return isMatch
        })
)

export const getEncryptedPasswordAndSalt = clearPassword => (
    randomBytesHex(keyLength)
        .then(salt => (
            encrypt({ clearPassword, salt })
                .then(password => ({
                    password,
                    salt
                }))
        ))
)