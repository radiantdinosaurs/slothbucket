'use strict'

const validationResult = require('express-validator/check').validationResult
const logger = require('../../utils/logging/logger')
const validate = require('../../middlewares/auth/validate')
const httpRequestController = require('../http-request-controller/http-request-controller')
const returnError = require('../../utils/error/return-error')

exports.get_register = (request, response, next) => response.status(200).render('register', { page: 'Register' })

exports.get_login = (request, response, next) => response.status(200).render('login', {page: 'Login'})

exports.post_register = [
    validate.validateUserRegistrationForm,
    function postRegister(request, response, next) {
        const user = request.body
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            response.status(200).render('register', { page: 'Register', user: user, errors: errors.array() })
        } else {
            httpRequestController.postRegisterRequest(user).then((result) => {
                if (result.error) {
                    // registration was unsuccessful (e.g., duplicate username), but we have a renderable error
                    const error = [{msg: result.error}]
                    response.status(200).render('register', {page: 'Register', user: request.body, errors: error})
                } else if (result.auth && result.token && result.user_id) {
                    // registration was successful, so we can make a session
                    request.session.userId = result.user_id
                    request.session.jwt = result.token
                    response.status(200).redirect('/')
                } else {
                    // none of the conditions were met or an error wasn't caught, so something went wrong unexpectedly
                    const error = returnError.unexpectedError()
                    logger.log('error', error)
                    next(error)
                }
            }).catch((error) => {
                logger.log('error', error)
                next(returnError.backendError())
            })
        }
    }
]

exports.post_login = [
    validate.validateLoginForm,
    function postLogin(request, response, next) {
        const user = request.body
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            response.status(200).render('login', { page: 'Login', errors: errors.array() })
        } else {
            httpRequestController.postLoginRequest(user).then((result) => {
                if (result.error) {
                    // login was unsuccessful (e.g., incorrect password), but we have a renderable error
                    const error = [{msg: result.error}]
                    response.status(200).render('login', {page: 'Login', errors: error})
                } else if (result.auth && result.token && result.user_id) {
                    // registration was successful, so we can make a session
                    request.session.userId = result.user_id
                    request.session.jwt = result.token
                    response.status(200).redirect('/')
                } else {
                    // none of the conditions were met or an error wasn't caught, so something went wrong unexpectedly
                    const error = returnError.unexpectedError()
                    logger.log('error', error)
                    next(error)
                }
            }).catch((error) => {
                logger.log('error', error)
                next(returnError.backendError())
            })
        }
    }
]

exports.logout = (request, response, next) => {
    if (request.session) {
        request.session.destroy((error) => {
            if (error) {
                logger.log('error', error)
                next(error)
            } else response.clearCookie('connect.sid', {path: '/'}).status(200).redirect('/')
        })
    } else response.status(200).redirect('/login')
}
