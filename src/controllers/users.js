import initConn from '../entities/conn'
import httpStatus from 'http-status'
import sequelize from 'sequelize'
import bcrypt from 'bcrypt-nodejs'
import { THIRDPARTY, ACTION_VERIFICATIONS } from '../consts'
import initEntities from '../entities'
import { isValidActionId, isValidUsernameAndPassword } from '../services/validator'
import { last, first } from 'lodash'
import { getToken }  from '../services/tokenizer'
import initTemplateManagements from '../services/template-managements'
import HttpError from '../utils/HttpError'
import initControllerUtil from './controllersUtils'
import { extract } from '../utils/SequelizeHelper'
import initEmailManagements from '../services/emails-managements'
import { compile } from '../services/template-render'
const init = ({ config, logger, _3rdPartyProviders }) =>{
  const EmailService = {} //require('../services/email-service')
 
  const {  Users, ActionVerifications } = initEntities({ config: config.database, logger })
  const conn = initConn({ config: config.database })
  const { getVerifyResponseHTML } = initTemplateManagements({
    ...config,
    compile
  })
  const { onCatch, onCatchLog } = initControllerUtil({ logger })
  const getPasswordEncrypt = (clearPassword) => (
    bcrypt.hashSync(clearPassword)
  )
  const{
    sendActivationEmail,
    sendResetPasswordEmail,
    sendApprovedActivationEmail,
    sendNotificationToAdminWhenUserCreated } = initEmailManagements({
      config: {
        ...config,
        compile
      }
    })

  const handleCustomErrorResponse = (res, error) => {
    res
      .status(httpStatus[error.message] ? error.message : httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: httpStatus[error.message] ? httpStatus[error.message] : httpStatus[httpStatus.INTERNAL_SERVER_ERROR] })
  }

  const setActionVerification = ({ username, actionType }, { returning }) => (
    ActionVerifications
      .findOne({ where: { username, actionType, deleted: false } })
      .then((exist) => (
        exist? exist: ActionVerifications.create({ username, actionType }, { returning })
      ))
      .then(({ dataValues }) => dataValues)
      .then(({ actionId }) => Object.assign({}, { username }, { actionId }))
  )

  const getActivationActionVerification = ({ username }) => (
    setActionVerification({
      username,
      actionType: ACTION_VERIFICATIONS.ACTIVATE_USER
    }, 
    { returning: true })
  )

  const getForgotPasswordActionVerification = ({ username }) => (
    setActionVerification({ 
      username, 
      actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD 
    }, 
    { returning: true })
  )

  const signUp = ({ username, password }) => {

    const logPrefix = `User (${username}) - signUp:`

    logger
      .info(`${logPrefix} requested.`)

    return (
      isValidUsernameAndPassword({ username, password })
        .catch(validation => {
          logger.log(validation)
          throw new HttpError(httpStatus.BAD_REQUEST, 'Invalid username / password policy')
        })
        .then(() => (
          { username, password: getPasswordEncrypt(password), isValid: false }
        ))
        .then((user) => (
          Users
            .create(user)
            .then(getActivationActionVerification)
            .then((info) => (
              sendActivationEmail(info)
                .catch(error =>{
                  const { code } = error 
                  if('EAUTH' === code){
                    throw 'Invalid email credentials, check email section in config'
                  }
                  throw error
                })
            ))
            .then(() => {
              logger
                .info(`${logPrefix} activation email sent to the user.`)

              return {
                code: httpStatus.CREATED,
                message: 'USER_CREATED_EMAIL_VERIFICATION_SENT'
              }
            })
            .catch(
              sequelize.UniqueConstraintError,
              error => {
                logger.error(error)
                throw new HttpError(httpStatus.CONFLICT)
              }
            )
        ))
        .catch((error) => {
          logger.error(error)
          if(!(error instanceof HttpError)){
            error = new HttpError()
          }
          throw error
        })
    )
  }

  const verify = (req, res) => {
    const { actionId } = req.params
    const logPrefix = `Action (${actionId}) - verify ->`

    logger
      .info(`${logPrefix} request to verify.`)

    isValidActionId({ actionId })
      .then(() => conn.transaction())
      .then(transaction => {
        return ActionVerifications
          .findOne({ where: { actionId, actionType: ACTION_VERIFICATIONS.ACTIVATE_USER } })
          .then((response) => {
            if (!response) {
              logger
                .error(`${logPrefix} action verification doesn't exist`)

              throw new HttpError(`Action verification doesn't exist`, httpStatus.BAD_REQUEST)
            }
            return response
          })
          .then(extract)
          .then((actionVerification) => {
            if (actionVerification.deleted) {
              logger
                .error(`${logPrefix} action verification expired`)

              throw new HttpError(`Action verification doesn't exist`, httpStatus.BAD_REQUEST)
            }
            return actionVerification
          })
          .then(({ actionId }) => (
            ActionVerifications
              .update({ deleted: true }, { where: { actionId }, returning: true })
              .then((actionVerificationUpdated) => {
                return first(last(actionVerificationUpdated))
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
              logger
                .error(`User not exist.`)
            
              throw new HttpError(`User not exist.`, httpStatus.BAD_REQUEST)
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
        transaction.commit()
  
        logger
          .info(`User (${username}) - verify -> user activated.`)

        sendApprovedActivationEmail({ username })

        const { appName, loginUrl } = config
        res
          .end(
            getVerifyResponseHTML({ appName, link: loginUrl, error: false })
          )

      })
      .catch((error) => {
        onCatchLog(error)
        const { appName, loginUrl } = config

        res
          .status(error.code)
          .end(
            getVerifyResponseHTML({ appName, link: loginUrl, error: true })
          )
      })
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

  const signInViaThirdparty = ({ thirdParty, username, password, res }) => {
    const logPrefix = `User (${username}) - signInViaThirdparty (${thirdParty}) ->`
    
    logger
      .info(`${logPrefix} requested.`)

    return isThirdpartySupprted(thirdParty)
      .then(() => verifyThirdPartyUser({ username, password, thirdParty }))
      .then(user => {
        if(!user.isValid){
          logger
            .log(`Invalid username / password`)

          throw new HttpError(httpStatus.BAD_REQUEST)
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
      .catch((error) => {
        onCatch(error, res)
      })
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

  const signIn = (req, res) => {
    const { username, password, thirdParty } = req.body
    logger
      .info(`User (${username}) - signIn -> signIn requested.`)

    isValidUsernameAndPassword({ username, password })
      .then((isValid) => {
        config.loginWithThirdParty && thirdParty ?
          signInViaThirdparty({ thirdParty, username, password, res }) :
          signInUser({ username, password, res })
      })
      .then(user => generateUserToken(user))
      .catch((error) => {
      onCatch(error, res)
      })  
  }

  const loginVia3rdParty = ({ username, token, thirdParty }) => {
    logger
      .info(`User (${username}) - login via ${thirdParty} -> requested.`)

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

  const signUpThirdPartyUser = ({ thirdParty, isValid, password, id, email: username, profilePhoto, name: fullName }) => (
    Users
      .findOne({ where: { username }, returning: true })
        .then(user => (
          user ?

            updateUser({ [thirdPartyProp[thirdParty]]: password, profilePhoto }, { username }) :

            createUser({ username, password, fullName, [thirdPartyProp[thirdParty]]: password, profilePhoto, isValid: true })
              .then((user) => {
                const { username, fullName } = user
                sendNotificationToAdminWhenUserCreated({ username, admin: config.adminEmail, fullName })
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

  const getUserInfo = (req, res) => {
    const { username, id } = req.userInfo
    const logPrefix = `User (${username}) - getUserInfo ->`

    logger
      .info(`${logPrefix} requested.`)

    Users.findOne({ where: { id } })
      .then(extract)
      .then(({ username, createdAt, updatedAt, profilePhoto }) => (
        { username, createdAt, updatedAt, profilePhoto }
      ))
      .then(({ username, createdAt, updatedAt, profilePhoto }) => {
        logger
          .info(`${logPrefix} succeeded.`)

        res
          .status(httpStatus.OK)
          .send({ username, createdAt, updatedAt, profilePhoto })
      })
      .catch((error) => {

        logger
          .error(`${logPrefix} ${error}.`)

        res
          .status(httpStatus.BAD_REQUEST)
      })
  }

  const generateUserToken = (user) => {
    logger
      .info(`User (${user.username}) -> generateUserToken requested.`)

    return new Promise((resolve, reject) => (
        getToken(user.id)
          .then(({ token }) => (
            Users
              .update({ token }, { where: { id: user.id }, returning: true })
              .then((response) => {
                response ?
                  resolve({ token }) :
                  reject({ message: 'INVALID_USERNAME_OR_PASSWORD' })
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

  const forgotPassword = (req, res) => {
    const { username } = req.body
    logger.info(`User (${username}) - forgotPassword`)
    Users
      .findOne({ where: { username }, returning: true })
      .then(user => {
        if (!user) {
          logger.error(`User (${username}) - forgotPassword -> User doesn't exist.`)
          res
            .status(httpStatus.NOT_FOUND)
            .json({ message: httpStatus[httpStatus.NOT_FOUND] })
        }

        return user.dataValues
      })
      .then((user) => {
        if (!user.isValid) {
          logger.error(`User (${username}) - forgotPassword -> User is not valid or not activated yet.`)
          res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: httpStatus[httpStatus.BAD_REQUEST] })
        }
        return user
      })
      .then(getForgotPasswordActionVerification)
      .then(sendResetPasswordEmail)
      .then((emailResponse) =>{
        logger
          .info(`User (${username}) - forgotPassword -> reset link sent to user.`)
        res
          .status(httpStatus.OK)
          .json({ message: 'RESTORE_PASSWORD_LINK_SENT_TO_YOUR_EMAIL' })
      })    
      .catch((error) => {
        logger
          .error(`User (${username}) - forgotPassword -> ${error}.`)
        
        res
          .status(httpStatus.BAD_REQUEST)
          .json({ error })
      })
  }

  const changePassword = (req, res) => {
    const { actionId } = req.params
    const { password } = req.body
    const { username } = req.userInfo
    logger.info(`User ${username} - changePassword: user request to change password with actionId ${actionId}`)
    isValidActionId({ actionId })
      .then(() => conn.transaction())
      .then(transaction => (
        ActionVerifications
          .findOne({ where: { actionId, deleted: false, actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD } })
          .then((actionVerification) => {
            if (!actionVerification) {
              logger.error('changePassword: ActionVerification record not found, probabbly obsolete')
              throw new Error(httpStatus.BAD_REQUEST)
            }
            const { dataValues } = actionVerification
            logger.info(`changePassword: user ${dataValues.username} request to change password`)  
            return 
          })
          .then(({ actionId }) => {
            return ActionVerifications
              .update(
              { deleted: true },
              {
                where:
                { actionId, actionType: ACTION_VERIFICATIONS.FORGORT_PASSWORD },
                returning: true,
                transaction
              })
              .then((actionVerificationUpdated) => {
                return first(last(actionVerificationUpdated))
              })
              .then((actionVerificationUpdated) => {
                return {
                  actionVerification: actionVerificationUpdated.dataValues,
                  transaction
                }
              })
          })
          .then(({ actionVerification, transaction }) => (
            Users
              .findOne({ where: { username: actionVerification.username, isValid: true } })
              .then(user => {
                if (!user) {
                  logger.error('changePassword: User record not found, probabbly user deleted from the system')
                  throw new Error(httpStatus.BAD_REQUEST)
                }

                return {
                  user: user.dataValues,
                  transaction
                }
              })
          ))
          .then(({ user, transaction }) => (
            Users
              .update(
              { password: getPasswordEncrypt(password) },
              {
                where: { id: user.id },
                transaction,
                returning: true
              }
              )
              .then((userMetadata) => ({
                effected: !!userMetadata[0],
                transaction
              }))
              .catch((error) => {
                logger.error(`changePassword: ${error}`)
                throw new Error(httpStatus.INTERNAL_SERVER_ERROR)
              })
          ))
          .then(({ effected, transaction }) => {
            transaction.commit()
            logger.info('changePassword: Password successfully changed for user')
            res
              .status(httpStatus.OK)
              .json({ message: 'PASSWORD_SUCCESSFULLY_CHANGED' })
          })
          .catch((error) => {
            logger.error(`changePassword: ${error}`)
            transaction.rollback()
            handleCustomErrorResponse(res, error)
          })
      ))
  }

  const signOut = (req, res) => {

    logger.info(`signOut: user(${req.userInfo.username})`)
    Users
      .update({ token: null }, { where: { id: req.userInfo.id }, returning: true })
      .then((response) => {
        if (!response) {
          logger.error(`signOut: user(${req.userInfo.username}) update db faild`)
          throw new Error(httpStatus.INTERNAL_SERVER_ERROR)
        }
        return response
      })
      .then((response) => first(last(response)))
      .then(({ dataValues }) => dataValues)
      .then(() => {
        logger.info(`signOut: user(${req.userInfo.username}) succeeded`)
        res
          .status(httpStatus.OK)
          .json({ message: 'USER_SUCCEEDED_TO_LOGOUT' })
      })
      .catch((error) => {
        logger.error(`signOut: user(${req.userInfo.username}) succeeded`)
        res
          .status(httpStatus.BAD_REQUEST)
          .json(error)
      })
  }


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