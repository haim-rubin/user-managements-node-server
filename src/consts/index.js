import keyMirror from 'key-mirror'
export const THIRDPARTY = Object.freeze({
    FACEBOOK: 'facebook',
    GOOGLE: 'google'
})

export const ENV = Object.freeze({
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
})

export const ACTION_VERIFICATIONS = Object.freeze({
    ACTIVATE_USER: 1,
    FORGORT_PASSWORD: 2
})

export const VERBAL_CODE = keyMirror({
    INVALID_PASSWORD_POLICY: null,
    INVALID_USERNAME_POLICY: null,
    INVALID_USERNAME_PASSWORD_POLICY: null,
    USERNAME_ALREADY_EXIST: null,
    INVALID_USERNAME_OR_PASSWORD: null,
    INVALID_USERNAME_OR_TOKEN: null,
    USER_CREATED_EMAIL_VERIFICATION_SENT: null,
    INVALID_EMAIL_CREDENTIALS_CHECK_EMAIL_SECTION_IN_CONFIG: null,
    ACTIVATION_EMAIL_SENT_TO_USER: null,
    RESTORE_PASSWORD_LINK_SENT_TO_USER_IS_EMAIL: null

})