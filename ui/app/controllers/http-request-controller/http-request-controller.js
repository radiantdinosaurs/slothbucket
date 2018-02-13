const httpRequest = require('request')
const logger = require('../../utils/logging/logger')

/**
 * Posts a registration request
 * @param user {Object} - object containing the user's data
 * @returns {Promise} - Promise representing if registration was successful
 */
function postRegisterRequest(user) {
    return new Promise((resolve, reject) => {
        httpRequest.post({url: 'http://localhost:8000/register',
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

/**
 * Posts a login request
 * @param user {Object} - object containing the user's data
 * @returns {Promise} - Promise representing if login was successful
 */
function postLoginRequest(user) {
    return new Promise((resolve, reject) => {
        httpRequest.post({
            url: 'http://localhost:8000/login',
            form: {
                username: user.username,
                password: user.password
            }
        }, (error, httpResponse, httpRequestBody) => {
            if (error) {
                logger.log('error', error)
                reject(error)
            } else resolve(JSON.parse(httpRequestBody))
        })
    })
}

module.exports.postRegisterRequest = postRegisterRequest
module.exports.postLoginRequest = postLoginRequest
