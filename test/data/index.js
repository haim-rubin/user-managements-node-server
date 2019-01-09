
import config from '../setup/app.dev.config.json'
export const credentials = {
    username: config.email.user,
    password: '00000000'
}

export const baseUrl = `http://localhost:${config.port}/user`
export const signInUrl = `${baseUrl}/sign-in`
export const signUpUrl = `${baseUrl}/sign-up`
export const verifyUrl = `${baseUrl}/verify`
export const signOutUrl = `${baseUrl}/sign-out`

