import initConn from '../entities/conn'
import httpStatus from 'http-status'
import sequelize from 'sequelize'
import bcrypt from 'bcrypt-nodejs'
import {
  THIRDPARTY,
  ACTION_VERIFICATIONS,
  VERBAL_CODE,
  POLICY_CODE_MAPPER,
  EVENTS } from '../consts'
import { isValidActionId, isValidUsernameAndPassword } from '../utils/validator'
import { last, first } from 'lodash'
import { getToken }  from '../utils/tokenizer'
import HttpError from '../utils/HttpError'
import { extract } from '../utils/SequelizeHelper'
const init = ({ config, logger, _3rdPartyProviders, dal, emit }) =>{
  const EmailService = {} //from '../services/email-service'

  const {  Users, ActionVerifications } = dal
  const conn = initConn({ config: config.database })


  const getPasswordEncrypt = (clearPassword) => (
    bcrypt.hashSync(clearPassword)
  )

  const throwIfInvalid = (error, httpStatusCode) => response => {
    if (!response) {
      logger
        .error(error)

      throw new HttpError(httpStatusCode)
    }
    return response
  }

  const setActionVerification = ({ user, actionType }, { returning }) => (
    ActionVerifications
      .findOne({ where: { username: user.username, actionType, deleted: false } })
      .then((exist) => (
        exist? exist: ActionVerifications.create({ username: user.username, actionType }, { returning })
      ))
      .then(extract)
      .then(({ actionId }) => ({ ...user, actionId }))
  )

  const getActivationActionVerification = user => (
    setActionVerification({
      user,
      actionType: ACTION_VERIFICATIONS.ACTIVATE_USER
    },
    { returning: true })
  )

  const getForgotPasswordActionVerification = user => (
    setActionVerification({
      user,
      actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD
    },
    { returning: true })
  )

  const signUp = ({ username, password }) => (
    isValidUsernameAndPassword({ username, password })
      .catch(validation => {
        logger.log(validation)
          const {
            isValidPassword,
            isValidUsername
          } = validation
          const code = POLICY_CODE_MAPPER[`${isValidUsername}-${isValidPassword}`]
          throw new HttpError(httpStatus.BAD_REQUEST, code)
      })
      .then(() => ({
        username,
        isValid: false,
        password: getPasswordEncrypt(password)
      }))
      .then((user) => (
        Users.create(user)
          .then(extract)
          .catch(
            sequelize.UniqueConstraintError,
            error => {
              logger.error(error)
              throw new HttpError(httpStatus.CONFLICT, VERBAL_CODE.USERNAME_ALREADY_EXIST)
          })
      ))
      .then(({ password, ...user }) => user)
      .then(getActivationActionVerification)
      .then((info) => (
        emit(EVENTS.USER_CREATED, info)
      ))
      .then(() => {
        logger
          .info(`${VERBAL_CODE.USER_CREATED_EMAIL_VERIFICATION_SENT}`)
        return {
          httpStatusCode: httpStatus.CREATED,
          message: httpStatus[httpStatus.CREATED]
        }
      })
      .catch((error) => {
        logger.error(error)
        throw error
      })
    )

  const verify = ({ actionId }) => {

    logger
      .info(`Verify user by action (${actionId})`)

    return (
      isValidActionId({ actionId })
      .then(() => conn.transaction())
      .then(transaction => {
        return ActionVerifications
          .findOne({ where: { actionId, actionType: ACTION_VERIFICATIONS.ACTIVATE_USER } })
          .then((response) => {
            if (!response) {
              throw new HttpError(httpStatus.FORBIDDEN, VERBAL_CODE.ACTION_VERIFICATION_DOES_NOT_EXIST)
            }
            return response
          })
          .then(extract)
          .then((actionVerification) => {
            if (actionVerification.deleted) {
              throw new HttpError(httpStatus.FORBIDDEN, VERBAL_CODE.ACTION_VERIFICATION_OBSOLETE)
            }
            return actionVerification
          })
          .then(({ actionId }) => (
            ActionVerifications
              .update({ deleted: true }, { where: { actionId }, returning: true })
              .then((actionVerificationUpdated) => {
                return last(actionVerificationUpdated)
              })
              .then(effected => {
                if(!effected){
                  throw new HttpError(httpStatus.INTERNAL_SERVER_ERROR, VERBAL_CODE.DELETE_ACTION_VERIFICATION_FAILED)
                }
                return ActionVerifications.findOne({ where: { actionId }})
              })
              .then(extract)
              .then(({ username }) => ({
                username,
                transaction
              }))
          )
          )
      })
      .then(({ username, transaction }) => (
        Users
          .findOne({ where: { username, isValid: false } })
          .then(user => {
            if (!user) {
              throw new HttpError(httpStatus.FORBIDDEN, VERBAL_CODE.USER_DOES_NOT_EXIST)
            }
            return user
          })
          .then(extract)
          .then((user) => (
            {
              user,
              transaction
            }
          ))
      ))
      .then(({ user, transaction }) => (
        Users
          .update({ isValid: true }, { where: { id: user.id }, transaction, returning: true })
          .then((userMetadata) => ({
            effected: !!userMetadata[0],
            transaction,
            username: user.username
          }))
      ))
      .then(({ effected, transaction, username }) => {
        transaction
          .commit()

        const logMessage =
          config.verifyUserByAdmin
          ? VERBAL_CODE.USER_VERIFIED_BY_ACTIVATION_LINK
          : VERBAL_CODE.USER_VERIFIED_BY_ACTIVATION_LINK_ADMIN

        logger.info(logMessage)
        logger.info(`User (${username}) activated.`)
        emit(EVENTS.USER_APPROVED, { username, admin: config.adminEmail })
       // sendApprovedActivationEmail({ username })

        return {
          httpStatusCode: httpStatus.OK
        }
      })
      .catch(error => {
        const { code } = error
        logger.error(code || error)
        throw error
      })
    )
  }

  const isThirdpartySupprted = (thirdParty) => (
    new Promise((resolve, reject) => {
      if(!_3rdPartyProviders[thirdParty]){
        logger.error(`${thirdParty} unsupported, if you wish for support extends providers api`)
        reject(new HttpError(httpStatus[httpStatus.BAD_REQUEST], httpStatus.BAD_REQUEST))
        return
      }
      resolve(true)
    })
  )

  const signInViaThirdparty = ({ thirdParty, username, password }) => {
    const logPrefix = `User (${username}) - signInViaThirdparty (${thirdParty}) ->`

    logger
      .info(`${logPrefix} requested.`)

    return isThirdpartySupprted(thirdParty)
      .then(() => verifyThirdPartyUser({ username, password, thirdParty }))
      .then(user => {
        if(!user.isValid){
          logger
            .log(`${VERBAL_CODE.INVALID_USERNAME_OR_TOKEN} - ${username}`)

          throw new HttpError(
            httpStatus.UNAUTHORIZED,
            VERBAL_CODE.INVALID_USERNAME_OR_TOKEN
          )
        }
        return user
      })
      .then((user) => (
        signUpThirdPartyUser({
          ...user,
          thirdParty,
          password
        })
      ))
  }

  const signInUser = ({ username, password }) => {
    const logPrefix = `User (${username}) - signInUser ->`

    logger
      .info(`${logPrefix} requested.`)

    return (
      Users
        .findOne({ where: { username } })
        .then((response) => {
          if (!response) {
            throw 'User not exist'
          }
          return response
        })
        .then(extract)
        .then((user) => {
          if(!user.isValid){
            throw 'User is not valid'
          }
          return user
        })
        .then((user) => (
          comparePassword(password, user.password)
            .then(() => user)
            .catch((error) => {
              logger.error(error)
              throw 'Invalid password'
            })
        ))
        .catch(error => {
          logger.error(error)
          throw new HttpError(httpStatus.UNAUTHORIZED)
        })
      )
  }

  const signIn = ({ username, password, thirdParty }) => {
    return isValidUsernameAndPassword({ username, password })
      .then(() => (
        config.loginWithThirdParty && thirdParty ?
          signInViaThirdparty({ thirdParty, username, password }) :
          signInUser({ username, password })
      ))
      .then(user => generateUserToken(user))
  }

  const loginVia3rdParty = ({ username, token, thirdParty }) => {
   return (
      _3rdPartyProviders[thirdParty].verify({ token })
      )
  }

  const thirdPartyProp = {
    [THIRDPARTY.FACEBOOK]: 'facebookToken',
    [THIRDPARTY.GOOGLE]: 'googleToken'
  }


  const createUser = (userData) => (
    Users
      .create(
        Object
          .assign(
            {},
            userData,
            { password: bcrypt.hashSync(userData.password) }
        )
      )
      .then(extract)
  )

  const updateUser = (params, condition, transaction) => (
    Users
      .update(
        params,
        {
          where: condition,
          returning: true
        },
        { transaction }
      )
      .then((updated) => first(last(updated)))
      .then(extract)
  )

  const signUpThirdPartyUser = ({ thirdParty, password, email: username, profilePhoto, name: fullName }) => (
    Users
      .findOne({ where: { username }, returning: true })
        .then(user => (
          user ?

            updateUser({
              [thirdPartyProp[thirdParty]]: password,
              profilePhoto
            }, { username }) :

            createUser({ username, password, fullName, [thirdPartyProp[thirdParty]]: password, profilePhoto, isValid: true })
              .then((user) => {
                const { username, fullName } = user
               // sendNotificationToAdminWhenUserCreated({ username, admin: config.adminEmail, fullName })
                return user
              })
            )
        )
  )

  const verifyThirdPartyUser = ({ username, password: token, thirdParty }) => {
    return (
      !!_3rdPartyProviders[thirdParty]
      && loginVia3rdParty({ username, token, thirdParty })
    )
  }

  const getUserInfo = ({ id }) => (
    Users.findOne({ where: { id } })
      .then(extract)
      .then(({ username, createdAt, updatedAt, profilePhoto }) => (
        { username, createdAt, updatedAt, profilePhoto }
      ))
      .catch(error => {
        logger
          .log(error)
        throw error
      })
  )

  const generateUserToken = (user) => {
    logger
      .info(`User (${user.username}) -> generateUserToken requested.`)

    return new Promise((resolve, reject) => (
        getToken(user.id, config.tokenHash)
          .then(({ token }) => (
            Users
              .update({ token }, { where: { id: user.id } }, {returning: true })
              .then((response) => {
                response ?
                  resolve({ token }) :
                  reject({ message: VERBAL_CODE.INVALID_USERNAME_OR_PASSWORD })
              })
          ))
    ))
  }

  const comparePassword = (password, dbPassword) => (
    new Promise((resolve, reject) => {
      bcrypt.compare(password, dbPassword, (error, isMatch) => {
        isMatch ? resolve(isMatch) : reject(error)
      })
    })
  )

  const forgotPassword = ({ username }) => {
    logger.info(`User (${username}) - forgotPassword`)

    return (
      Users
        .findOne({ where: { username }, returning: true })
        .then(user => {
          if (!user) {
            logger
              .error(`User doesn't exist (${username}).`)

            throw new HttpError(httpStatus.NOT_FOUND)
          }
          return user
        })
        .then(extract)
        .then((user) => {
          if (!user.isValid) {
            logger
              .error(`User is not valid or not activated yet (${username}).`)

            throw new HttpError (httpStatus.FORBIDDEN)
          }
          return user
        })
        .then(getForgotPasswordActionVerification)
       // .then(sendResetPasswordEmail)
        .then(() => {

          logger
            .info(`Reset link sent to user (${username}).`)

          return {
            httpStatusCode: httpStatus.OK,
            message: VERBAL_CODE.RESTORE_PASSWORD_LINK_SENT_TO_USER_IS_EMAIL
          }
        })
    )
  }

  const isPasswordsEqual = ({ password, confirmPassword }) => (
    new Promise((resolve, reject) => {
      password === confirmPassword
        ? resolve()
        : reject()
    })
  )

  const updateActionVerificationRequest = transaction => ({ actionId }) => (
    ActionVerifications
      .update(
        { deleted: true },
        {
          where:
          { actionId, actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD },
          returning: true,
          transaction
        }
      )
      .then((actionVerification) => {
        return first(last(actionVerification))
      })
      .then(extract)
      .then((actionVerification) => {
        return {
          actionVerification,
          transaction
        }
      })
  )

  const changeUserPassword = ({ id, password, transaction }) => (
    Users
      .update(
        { password: getPasswordEncrypt(password) },
        {
          where: { id },
          transaction,
          returning: true
        }
      )
  )

  const changePassword = ({ actionId, password, confirmPassword }) => (
    isPasswordsEqual({ password, confirmPassword })
      .then(() =>
        isValidActionId({ actionId })
          .then(() => conn.transaction())
          .then(transaction => (
            ActionVerifications
              .findOne({
                where: {
                  actionId,
                  deleted: false,
                  actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD
                }
              })
              .then(
                throwIfInvalid(
                  'ActionVerification record not found or obsolete',
                  httpStatus.NOT_FOUND
                )
              )
              .then(extract)
              .then(updateActionVerificationRequest(transaction))
              .then(({ actionVerification, transaction }) => (
                Users
                  .findOne({ where: { username: actionVerification.username, isValid: true } })
                  .then(
                    throwIfInvalid(
                      'User record not found, probabbly user deleted from the system',
                      httpStatus.NOT_FOUND
                    )
                  )
                  .then(extract)
                  .then(user = ({ user, transaction }))
              ))
              .then(({ user, transaction }) => (
                changeUserPassword({ id: user.id, password, transaction})
                  .then(() => transaction.commit() )
              ))
              .then(() => ({
                httpStatusCode: httpStatus.OK,
                message: VERBAL_CODE.PASSWORD_SUCCESSFULLY_CHANGED
              }))
              .catch((error) => {
                transaction.rollback()
                throw error
              })
          ))
        )
  )

  const signOut = ({ username, id }) => (
    Users
      .update({ token: null }, { where: { id: id }, returning: true })
      .then((response) => {
        if (!response) {
          throw `Update user (${username}) in db failed`
        }
        return response
      })
      .then(() => ({
        httpStatusCode: httpStatus.OK
      }))
      .catch(error => {
        logger.error(error)
        throw new HttpError(
          httpStatus.UNAUTHORIZED,
          httpStatus[httpStatus.UNAUTHORIZED]
        )
      })
  )


  return {
    signUp,
    verify,
    signIn,
    forgotPassword,
    changePassword,
    getUserInfo,
    signOut
  }
}
export default init