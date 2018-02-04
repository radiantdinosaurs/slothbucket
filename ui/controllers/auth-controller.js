'use strict'

const { validationResult } = require('express-validator/check')
const logger = require('../utils/logging/logger')
const validate = require('../utils/auth/validate')
const httpRequest = require('request')
const returnError = require('../utils/error/return-error')

exports.get_register = (request, response, next) => response.status(200).render('register', { title: 'Register' })

exports.get_login = (request, response, next) => response.status(200).render('login', {title: 'Login'})

exports.post_register = [
    validate.validateUserRegistrationForm,
    (request, response, next) => {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            response.status(200).render('register', { title: 'Register', user: request.body, errors: errors.array() })
        } else {
            httpRequest.post({url: 'http://localhost:8000/register',
                form: {
                    username: request.body.username,
                    display_name: request.body.display_name,
                    email: request.body.email,
                    password: request.body.password,
                    passwordConfirmation: request.body.passwordConfirmation
                }}, (error, httpResponse, httpRequestBody) => {
                if (error) {
                    logger.log('error', error)
                    next(error)
                } else {
                    const body = JSON.parse(httpRequestBody)
                    if (body.error) {
                        // specific error message from the server, usually indicating user already exists
                        error = [{msg: body.error}]
                        response.status(200).render('register', {title: 'Register', user: request.body, errors: error})
                    } else if (body.auth && body.token && body.user_id) {
                        request.session.userId = body.user_id
                        request.session.jwt = body.token
                        response.status(200).redirect('/')
                    } else next(returnError.backendError())
                }
            })
        }
    }
]

exports.post_login = [
    validate.validateLoginForm,
    (request, response, next) => {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            response.status(200).render('login', { title: 'Login', errors: errors.array() })
        } else {
            httpRequest.post({url: 'http://localhost:8000/login',
                form: {
                    username: request.body.username,
                    password: request.body.password
                }}, (error, httpResponse, httpRequestBody) => {
                if (error) {
                    logger.log('error', error)
                    next(returnError.backendError())
                } else {
                    const body = JSON.parse(httpRequestBody)
                    if (body.error) {
                        // specific error message from the server, usually pertaining to incorrect username/password
                        error = [{msg: body.error}]
                        response.status(200).render('login', {title: 'Login', errors: error})
                    } else if (body.auth && body.token && body.user_id) {
                        request.session.userId = body.user_id
                        request.session.jwt = body.token
                        console.log(request.session)
                        response.status(200).redirect('/')
                    } else next(returnError.backendError())
                }
            })
        }
    }
]

exports.logout = function logOut(request, response, next) {
    if (request.session) {
        request.session.destroy(function(error) {
            if (error) {
                logger.log('error', error)
                return next(error)
            } else return response.clearCookie('connect.sid', { path: '/' }).status(200).redirect('/')
        })
    } else response.status(200).redirect('/login')
}
