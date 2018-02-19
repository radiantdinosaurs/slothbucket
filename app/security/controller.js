'use strict'

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validationResult = require('express-validator/check').validationResult
const formValidation = require('./form-validation')
const returnError = require('../errors/index')
const logger = require('../logging/index')
const userController = require('../users/index')
const SECRET = process.env.SECRET

// handler for user authentication route
const handleAuthenticationRoute = [
    formValidation.validateAuthenticationForm,
    (request, response) => {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            errors.formatWith(({location, param, value, msg}) => msg) // removes all but the error message
            response.status(200).send({status: 200, error: errors.array()})
        } else {
            const user = {
                username: request.body.username,
                password: request.body.password
            }
            // first, find the users in the database
            userController.findUser(user.username).then((result) => {
                // next, verify the password they provided in the request body
                verifyPassword(result.password, user.password).then(() => {
                    const userId = result._id
                    let token = jwt.sign({id: userId}, SECRET, {expiresIn: 86400}) // expires in one day
                    response.status(200).send({auth: true, token: token, user_id: userId})
                }).catch((error) => {
                    logger.log('error', error)
                    response.status(error.code).send({status: error.code, error: error.message})
                })
            }).catch((error) => {
                logger.log('error', error)
                response.status(error.code).send({status: error.code, error: error.message})
            })
        }
    }
]

/**
 * Verifies a JSON web token (JWT)
 * @param request {Object} - HTTP request
 * @param response {Object} - HTTP request
 * @param next - callback
 */
function verifyToken(request, response, next) {
    if (request.headers && request.headers['x-access-token']) {
        const token = request.headers['x-access-token']
        const secret = process.env.SECRET
        jwt.verify(token, secret, (error) => {
            console.log(error)
            if (error) {
                logger.log('error', error)
                error = returnError.failedAuthentication()
                response.status(error.code).send({status: error.code, message: error.message})
            } else next()
        })
    } else {
        const error = returnError.failedAuthentication()
        response.status(error.code).send({status: error.code, message: error.message})
    }
}

/**
 * Verifies the users's password (from session form) against the users's password stored in the database
 * @param actualPassword {string} - users's actual password from the database
 * @param givenPassword {string} - password given from the session form
 * @returns {Promise} - Promise representing if password was verified
 */
function verifyPassword(actualPassword, givenPassword) {
    return new Promise((resolve, reject) => {
        if (actualPassword && givenPassword) {
            bcrypt.compare(givenPassword, actualPassword, function(error, result) {
                if (error) {
                    logger.log('error', error)
                    error = returnError.internalError()
                    reject(error)
                } else if (result) {
                    resolve(result)
                } else {
                    const error = returnError.incorrectUsernameOrPassword()
                    reject(error)
                }
            })
        } else reject(returnError.generalInvalidArgument())
    })
}

module.exports = {
    handleAuthentication: handleAuthenticationRoute,
    requiresToken: verifyToken
}
