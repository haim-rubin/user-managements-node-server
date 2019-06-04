import initConn from '../entities/conn'
import httpStatus from 'http-status'
import sequelize from 'sequelize'
import bcrypt from 'bcrypt-nodejs'
import {
  THIRDPARTY,
  ACTION_VERIFICATIONS,
  VERBAL_CODE,
  POLICY_CODE_MAPPER,
  EVENTS,
  VERIFY_USER_BY } from '../consts'
import { isValidActionId, isValidUsernameAndPassword, isValidPasswords } from '../utils/validator'
import { last, first } from 'lodash'
import { getToken }  from '../utils/tokenizer'
import HttpError from '../utils/HttpError'
import { extract } from '../utils/SequelizeHelper'
import { getEncryptedPasswordAndSalt, verifyPassword } from '../utils/credentials'
const init = ({ config, logger, _3rdPartyProviders, dal, emit }) =>{
  const EmailService = {} //from '../services/email-service'

  const emailVerificationTo = {
    [VERIFY_USER_BY.ADMIN_EMAIL_LINK]: VERBAL_CODE.USER_CREATED_EMAIL_VERIFICATION_SENT_TO_ADMIN,
    [VERIFY_USER_BY.EMAIL_LINK]: VERBAL_CODE.USER_CREATED_EMAIL_VERIFICATION_SENT_TO_USER,
    [VERIFY_USER_BY.AUTO]: VERBAL_CODE.USER_CREATE_AND_AUTO_VERIFY
  }
  const isAutoValid =
    config.verifyUserBy === VERIFY_USER_BY.AUTO

  const is3rdPartyAutoValid =
    config.verify3rdPartyUserBy === VERIFY_USER_BY.AUTO

  const {  Users, ActionVerifications } = dal
  const conn = initConn({ config: config.database })

  const setActionVerification = ({ user, actionType }, { returning }) => (
    ActionVerifications
      .findOne({ where: { username: user.username, actionType, deleted: false } })
      .then((exist) => (
        exist
        ? exist
        : ActionVerifications.create({ username: user.username, actionType }, { returning })
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
      .then(() => getEncryptedPasswordAndSalt(password))
      .then( ({ password, salt }) => ({
        password,
        salt,
        username,
        isValid: isAutoValid
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
      .then(user => {
        if(isAutoValid){
          return user
        }

        return(
          getActivationActionVerification(user)
        )
      })
      .then((info) => (
        emit(EVENTS.USER_CREATED, info)
      ))
      .then(() => {
        logger
          .info(`User verify by: ${emailVerificationTo[config.verifyUserBy]}`)
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
          config.verifyUserBy
          ? VERBAL_CODE.USER_VERIFIED_BY_ACTIVATION_LINK
          : VERBAL_CODE.USER_VERIFIED_BY_ACTIVATION_LINK_ADMIN

        logger.info(logMessage)
        logger.info(`User (${username}) activated.`)
        emit(EVENTS.USER_APPROVED, { username, admin: config.adminEmail })

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
            throw VERBAL_CODE.USER_DOES_NOT_EXIST
          }
          return response
        })
        .then(extract)
        .then((user) => {
          if(!user.isValid){
            throw VERBAL_CODE.USER_IS_NOT_VALID
          }
          return user
        })
        .then((user) => (
          verifyPassword({ password, encryptedPassword: user.password, salt: user.salt })
            .then(() => user)
            .catch((error) => {
              logger.error(error)
              throw VERBAL_CODE.INVALID_PASSWORD
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
      .then(user => {
        if(!user.isValid){
          logger.error(`User ${user.username} is not valid.`)
          throw new HttpError(httpStatus.UNAUTHORIZED)
        }
        return user
      })
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

            createUser({ username, password, fullName, [thirdPartyProp[thirdParty]]: password, profilePhoto, isValid: is3rdPartyAutoValid })
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
        : reject(
            new HttpError(
              httpStatus.BAD_REQUEST,
              VERBAL_CODE.CONFIRM_PASSWORD_NOT_EQUAL_TO_PASSWORD
            )
          )
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
        const affected =
          [].concat(actionVerification)
            .filter( x => x)

        logger.info(`ActionVerification updated: ${affected.join(',')}`)
        return affected
      })
      .then(() => ActionVerifications.findOne(
        {
          where:
          { actionId, actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD }
        }
      ))
      .then(extract)
      .then((actionVerification) => {
        return {
          actionVerification,
          transaction
        }
      })
  )

  const changeUserPassword = ({ id, password, transaction }) => (
    getEncryptedPasswordAndSalt(password)
      .then(({ password, salt }) => (
        Users
          .update(
            { password, salt},
            {
              where: { id },
              transaction,
              returning: true
            }
          )
      ))
  )



  const changePassword = ({ actionId, password, confirmPassword }) => (
    isValidPasswords({ password, confirmPassword })
      .then(isPasswordsEqual)
        .catch(error => {
          logger.error(`Invalid password/confirmPassword ${error.code}`)
          throw error
        })
        .then(() =>
          isValidActionId({ actionId })
            .then(() => conn.transaction())
            .then(transaction => (
              ActionVerifications
                .findOne({
                  where: {
                    actionId,
                    actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD
                  }
                })
                .then(actionVerification => {
                  if(!actionVerification){
                    logger.error(VERBAL_CODE.ACTION_VERIFICATION_DOES_NOT_EXIST)
                    throw new HttpError(
                      httpStatus.FORBIDDEN,
                      httpStatus[httpStatus.FORBIDDEN]
                    )
                  }
                  return actionVerification
                })
                .then(extract)
                .then(actionVerification => {
                  if(actionVerification.deleted){
                    logger.error(VERBAL_CODE.ACTION_VERIFICATION_OBSOLETE)
                    throw new HttpError(
                      httpStatus.FORBIDDEN,
                      httpStatus[httpStatus.FORBIDDEN]
                    )
                  }
                  return actionVerification
                })
                .then(updateActionVerificationRequest(transaction))
                .then(({ actionVerification, transaction }) => (
                  Users
                    .findOne({ where: { username: actionVerification.username } })
                    .then(user => {
                      if(!user){
                        logger.error(VERBAL_CODE.USER_DOES_NOT_EXIST)
                        throw new HttpError(
                          httpStatus.FORBIDDEN,
                          httpStatus[httpStatus.FORBIDDEN]
                        )
                      }
                      return user
                    })
                    .then(extract)
                    .then(user => {
                      if(!user.isValid){
                        logger.error(VERBAL_CODE.USER_IS_NOT_VALID)
                        throw new HttpError(
                          httpStatus.FORBIDDEN,
                          httpStatus[httpStatus.FORBIDDEN]
                        )
                      }
                      return user
                    })
                    .then(user => ({ user, transaction }))
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
                  logger.error(`Error: ${error.httpStatusCode} - ${error.code}`)
                  logger.error(error)
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