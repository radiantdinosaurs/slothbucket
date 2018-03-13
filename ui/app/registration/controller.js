'use strict'

const validationResult = require('express-validator/check').validationResult
const httpRequest = require('request')
const logger = require('../logging/index')
const validate = require('../security/form-validation')
const returnError = require('../errors/index')
const config = require('../../config/config')

// handles the HTTP GET for the route /register
const handleGetRegisterRoute = (request, response, next) => {
    response.status(200).render('register', { page: 'Register' })
}

// handles the HTTP POST for the route /register
const handlePostRegisterRoute = [
    validate.validateUserRegistrationForm,
    function postRegister(request, response, next) {
        const user = request.body
        const errors = validationResult(request)
        if (!errors.isEmpty()) {
            response.status(200).render('register', { page: 'Register', user: user, errors: errors.array() })
        } else {
            postRegisterRequestToAPI(user).then((result) => {
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

/**
 * Posts a registration request to the backend's route /register
 * @param user {Object} - Object containing the users's data (i.e., username, password, etc.)
 * @returns {Promise} - Promise representing if registration was successful
 */
function postRegisterRequestToAPI(user) {
    return new Promise((resolve, reject) => {
        const url = config.BACKEND_URL + '/register'
        httpRequest.post({url: url,
            form: {
                username: user.username,
                display_name: user.display_name,
                email: user.email,
                password: user.password,
                passwordConfirmation: user.passwordConfirmation
            }}, (error, httpResponse, httpRequestBody) => {
            if (error) {
                logger.log('error', error)
                reject(error)
            } else resolve(JSON.parse(httpRequestBody))
        })
    })
}

module.exports = {
    getRegister: handleGetRegisterRoute,
    postRegister: handlePostRegisterRoute
}
