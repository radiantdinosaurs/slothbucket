'use strict'

const User = require('../models/user')
const logger = require('../utils/log/logger')
const returnError = require('../utils/error/return-error')
const duplicateUserFound = 11000 // https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.err

/**
 * Creates a new user in the database
 * @param userData {Object} - Object containing user's data: username, password, etc.
 * @returns {Promise} - Promise representing if user was created
 */
function createUser(userData) {
    return new Promise((resolve, reject) => {
        User.create(userData, (error, user) => {
            if (error) {
                logger.log('error', error)
                if (error.code === duplicateUserFound) {
                    error = returnError.duplicateUserFound()
                } else error = returnError.internalError()
                reject(error)
            } else resolve(user)
        })
    })
}

/**
 * Finds an existing user in the database
 * @param username {string} - name of the user
 * @returns {Promise} - Promise representing if user was found
 */
function findUser(username) {
    return new Promise((resolve, reject) => {
        User.findOne({username: username}, 'password', (error, user) => {
            if (error) {
                logger.log('error', error)
                error = returnError.internalError()
                reject(error)
            } else if (!user) {
                const error = returnError.incorrectUsernameOrPassword()
                reject(error)
            } else resolve(user)
        })
    })
}

module.exports.createUser = createUser
module.exports.findUser = findUser
