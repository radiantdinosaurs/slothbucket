'use strict'

const jwt = require('jsonwebtoken')
const config = require('../../config')
const returnError = require('../error/return-error')
const logger = require('../log/logger')
const bcrypt = require('bcrypt')

/**
 * Verifies a JSON web token (JWT)
 * @param request {Object} - HTTP request
 * @param response {Object} - HTTP request
 * @param next - callback
 */
function verifyToken(request, response, next) {
    if (request.headers['x-access-token']) {
        const token = request.headers['x-access-token']
        const secret = config.secret
        jwt.verify(token, secret, (error) => {
            if (error) {
                logger.log('error', error)
                error = returnError.failedAuthentication()
                response.status(error.code).send({status: error.code, message: error.message})
            } else return next()
        })
    } else {
        const error = returnError.failedAuthentication()
        response.status(error.code).send({status: error.code, message: error.message})
    }
}

/**
 * Verifies the user's password (from login form) against the user's password stored in the database
 * @param user {Object} - User object represent a user from the database
 * @param password - password given from login form
 * @returns {Promise} - Promise representing if password was verified
 */
function verifyPassword(user, password) {
    return new Promise((resolve, reject) => {
        if (user.password && password) {
            bcrypt.compare(password, user.password, function(error, result) {
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

module.exports.requiresToken = verifyToken
module.exports.verifyPassword = verifyPassword
