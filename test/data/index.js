
import config from '../setup/app.dev.config.json'
export const credentials = {
    username: config.email.user,
    password: '00000000'
}

export const baseUrl = `http://localhost:${config.port}/user`
export const signInRoute = `/sign-in`
export const signUpRoute = `/sign-up`
export const verifyRoute = `/verify`
export const signOutRoute = `/sign-out`
export const forgotPasswordRoute = `/forgot-password`
export const changePasswordRoute = `/change-password`

