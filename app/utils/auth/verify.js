'use strict'

const jwt = require('jsonwebtoken')
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
 * Verifies the user's password (from login form) against the user's password stored in the database
 * @param actualPassword {string} - user's actual password from the database
 * @param givenPassword {string} - password given from the login form
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

module.exports.requiresToken = verifyToken
module.exports.verifyPassword = verifyPassword
