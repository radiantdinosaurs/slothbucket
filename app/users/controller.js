'use strict'

const logger = require('../logging/index')
const User = require('./user')
const returnError = require('../errors/index')
const DUPLICATE_USER_FOUND = 11000 // https://github.com/mongodb/mongo/blob/master/src/mongo/base/error_codes.err

/**
 * Creates a new users in the database
 * @param userData {Object} - Object containing users's data: username, password, etc.
 * @returns {Promise} - Promise representing if users was created
 */
function createUser(userData) {
    return new Promise((resolve, reject) => {
        User.create(userData, (error, user) => {
            if (error) {
                logger.log('error', error)
                if (error.code === DUPLICATE_USER_FOUND) error = returnError.duplicateUserFound()
                else error = returnError.internalError()
                reject(error)
            } else resolve(user)
        })
    })
}

/**
 * Finds an existing users in the database
 * @param username {string} - name of the users
 * @returns {Promise} - Promise representing if users was found
 */
function findUser(username) {
    return new Promise((resolve, reject) => {
        User.findOne({username: username}, 'password', (error, user) => {
            if (error) {
                logger.log('error', error)
                error = returnError.internalError()
                reject(error)
            } else if (user) {
                resolve(user)
            } else {
                reject(returnError.incorrectUsernameOrPassword())
            }
        })
    })
}

module.exports = {
    createUser: createUser,
    findUser: findUser
}
