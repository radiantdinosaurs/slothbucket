'use strict'

const validationResult = require('express-validator/check').validationResult
const httpRequest = require('request')
const logger = require('../logging/index')
const validate = require('../security/form-validation')
const returnError = require('../errors/index')

// handle for getting the login page
const handleGetLoginRoute = (request, response, next) => response.status(200).render('login', {page: 'Login'})

// handler for post the login form
const handlePostLoginRoute = [
    validate.validateAuthenticationForm,
    function postLogin(request, response, next) {
        const user = request.body
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            response.status(200).render('login', { page: 'Login', errors: errors.array() })
        } else {
            postAuthenticationRequestToAPI(user).then((result) => {
                if (result.error) {
                    // session was unsuccessful (e.g., incorrect password), but we have a renderable error
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

// handler for logging out
const handleLogoutRoute = (request, response, next) => {
    if (request.session) {
        request.session.destroy((error) => {
            if (error) {
                logger.log('error', error)
                next(error)
            } else response.clearCookie('connect.sid', {path: '/'}).status(200).redirect('/')
        })
    } else response.status(200).redirect('/login')
}

/**
 * Posts a request for authentication to the API
 * @param user {Object} - object containing the users's data
 * @returns {Promise} - Promise representing if session was successful
 */
function postAuthenticationRequestToAPI(user) {
    return new Promise((resolve, reject) => {
        httpRequest.post({
            url: 'http://localhost:8000/authenticate',
            form: {
                username: user.username,
                password: user.password
            }
        }, (error, httpResponse, httpRequestBody) => {
            if (error) reject(error)
            else resolve(JSON.parse(httpRequestBody))
        })
    })
}

/**
 * Verifies that users has an existing, valid session for protected pages
 * @param request {Object} - HTTP request
 * @param response {Object} - HTTP request
 * @param next - callback
 */
function requiresLogin(request, response, next) {
    if (request.session && request.session.userId && request.session.jwt) return next()
    else {
        let error = [{msg: 'You must be logged in to view this page'}]
        error.status = 401
        response.render('login', { title: 'Login', errors: error })
    }
}

/**
 * Verifies that users doesn't have an existing, valid session for some pages (e.g., 'session' page and 'register' page)
 * @param request {Object} - HTTP request
 * @param response {Object} - HTTP request
 * @param next - callback
 */
function requiresLogout(request, response, next) {
    if (request.session && request.session.userId && request.session.jwt) response.redirect('/')
    else next()
}

module.exports = {
    postLogin: handlePostLoginRoute,
    getLogin: handleGetLoginRoute,
    logout: handleLogoutRoute,
    requiresLogin: requiresLogin,
    requiresLogout: requiresLogout
}
