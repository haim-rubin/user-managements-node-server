const keyMirror = require('key-mirror')

const CONSTANTS = Object.freeze(
    {
        PRODUCTION: 'production',
        DEVELOPMENT: 'development',
        THIRDPARTY: {
            FACEBOOK: 'facebook',
            GOOGLE: 'google'
        },
        CODES: {
            ERROR_WHILE_RETRIEVING_DATA: 506,
            BAD_REQUEST: 507,
            USER_ALREADY_EXISTS: 508,
            INVALID_EMAIL: 509,
            MISSING_PARAMS: 510,
            SPACES_NOT_ALLOWED: 511,
            ACCESS_DENIED: 512,
            INVALID_VALIDATION_TOKEN: 513,
            UNSUPPORTED_THIRD_PARTY: 514,
            NOT_FOUND: 515,
            NOT_ALLOWED: 516,
            ALREADY_EXIST: 517
        },
        MESSAGES: {
            USER_CREATED_GO_TO_EMAIL: 'User created, please browse to your email to complete the activation.',
            USER_CREATED_EMAIL_VERIFICATION_SENT: 'User create, email verification sent',
            USERNAME_ALREADY_EXIST: 'Username already exist in system',
            INTERNAL_SERVER_ERROR: 'Internal server error',
            USER_NOT_ACTIVATED: 'User not activated',
            USER_ACTIVATED: 'User activated',
            RESTORE_PASSWORD_LINK_SENT_TO_YOUR_EMAIL: 'Password reset link sent to your Email',
            USER_NOT_EXIST: 'User does not exist',
            INVALID_USERNAME_OR_PASSWORD: 'Invlid username or password',
            UNSUPPORTED_THIRD_PARTY: 'Unsupported third party',
            BAD_REQUEST: 'Bad request',
            PASSWORD_SUCCESSFULLY_CHANGED: 'Password successfully changed',
            USER_SUCCEEDED_TO_LOGOUT: 'User succeeded to logout'
        },
        ACTION_VERIFICATIONS: {
            ACTIVATE_USER: 1,
            FORGORT_PASSWORD: 2
        }
    }
)

module.exports = CONSTANTS