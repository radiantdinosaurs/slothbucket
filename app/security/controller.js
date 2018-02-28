'use strict'

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validationResult = require('express-validator/check').validationResult
const formValidation = require('./form-validation')
const returnError = require('../errors/index')
const logger = require('../logging/index')
const userController = require('../users/index')
const SECRET = process.env.SECRET

// handles the HTTP POST for route /authenticate
const handleAuthenticationRoute = [
    formValidation.validateAuthenticationForm,
    (request, response, next) => {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            errors.formatWith(({location, param, value, msg}) => msg)
            response.status(200).send({status: 200, error: errors.array()})
        } else {
            const user = {
                username: request.body.username,
                password: request.body.password
            }
            // first, find the user in the database
            userController.findUserByUserName(user.username).then((result) => {
                // next, compare their password in the database to the one they gave in the request body
                verifyPassword(result.password, user.password).then(() => {
                    const userId = result._id
                    let token = jwt.sign({id: userId}, SECRET, {expiresIn: 86400}) // expires in one day
                    response.status(200).send({auth: true, token: token, user_id: userId})
                }).catch((error) => {
                    logger.log('error', error)
                    next(error)
                })
            }).catch((error) => {
                logger.log('error', error)
                next(error)
            })
        }
    }
]

/**
 * Verifies a JSON web token (JWT) from the request header
 * @param request {Object} - HTTP request
 * @param response {Object} - HTTP response
 * @param next - callback
 */
function verifyToken(request, response, next) {
    if (request.headers && request.headers['x-access-token']) {
        const token = request.headers['x-access-token']
        const secret = process.env.SECRET
        jwt.verify(token, secret, (error) => {
            if (error) {
                logger.log('error', error)
                error = returnError.failedTokenAuthentication()
                next(error)
            } else next()
        })
    } else {
        const error = returnError.failedTokenAuthentication()
        next(error)
    }
}

/**
 * Verifies a given password against the user's password stored in the database
 * @param actualPassword {string} - user's actual password from the database
 * @param givenPassword {string} - password given from the user
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
        } else reject(returnError.incompleteArguments())
    })
}

module.exports = {
    handleAuthentication: handleAuthenticationRoute,
    requiresToken: verifyToken
}
