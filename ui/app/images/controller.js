'use strict'

const httpRequest = require('request')
const returnError = require('../errors/index')
const logger = require('../logging/index')
const config = require('../config/config')

// handles HTTP GET for the route /image-library
function handleImageLibraryRoute(request, response, next) {
    const userId = request.session.userId
    const token = request.session.jwt
    getImageLibrary(userId, token).then((base64Images) => {
        if (base64Images.length === 0) {
            const error = [{msg: "You don't have any images yet!"}]
            response.status(200).render('images', {page: 'Slothbucket: Images', errors: error})
        } else response.status(200).render('images', {page: 'Slothbucket: Images', images: base64Images})
    }).catch((error) => {
        logger.log('error', error)
        next(error)
    })
}

/**
 * Sends a HTTP GET request to the backend's route /image-library
 * @param userId - user's id
 * @param token - JWT of authenticated user
 * @returns {Promise} - Promise representing if the HTTP GET request was successful
 */
function getImageLibrary(userId, token) {
    return new Promise((resolve, reject) => {
        const url = config.BACKEND_URL + '/images/' + userId
        const options = {
            url: url,
            headers: {'x-access-token': token}
        }
        httpRequest.get(options, (error, httpResponse, httpRequestBody) => {
            const result = JSON.parse(httpRequestBody)
            if (error) {
                logger.log('error', error)
                reject(returnError.backendError())
            } else if (result.error) {
                reject(returnError.backendError())
            } else resolve(JSON.parse(httpRequestBody))
        })
    })
}

module.exports = {
    handleImageLibraryRoute: handleImageLibraryRoute
}
