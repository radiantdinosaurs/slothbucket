'use strict'

const multer = require('multer')
const httpRequest = require('request')
const returnError = require('../errors/index')
const logger = require('../logging/index')
const config = require('../../config/config')
const uploadFile = multer({
    destination: './',
    limits: {
        fileSize: 5000000 // limit file size to 5MB
    }
})

// handles HTTP POST for the route /upload-image
const handleUploadImageRoute = [
    uploadFile.single('file'),
    (request, response, next) => {
        const token = request.session.jwt
        const file = request.file
        const userId = request.session.userId
        handleUploadingImage(file, userId, token).then((uploadResponse) => {
            if (uploadResponse['sloth_check'].contains_sloth) response.redirect('/images')
            else {
                response.status(200).render('index', {page: 'Slothbucket', no_sloth: 'There\'s no sloth!'})
            }
        }).catch((error) => {
            if (error.code && error.code === 400) {
                response.status(200).render('index', {page: 'Slothbucket', errors: [{msg: error.message}]})
            } else next(error)
        })
    }
]

/**
 * Sends a HTTP POST to the backend's route /classify-image
 * @param base64 {string} - base64 image
 * @param userId {string} - user's id
 * @param token {string} - JWT of authenticated user
 * @returns {Promise} - Promise representing if posting to the route was successful
 */
function postClassifyImage(base64, userId, token) {
    return new Promise((resolve, reject) => {
        const url = config.BACKEND_URL + '/images/classify'
        const options = {
            url: url,
            headers: {'x-access-token': token},
            form: {user_id: userId, base64: base64}
        }
        httpRequest.post(options, (error, httpResponse, httpRequestBody) => {
            if (error) {
                logger.log('error', error)
                reject(returnError.unexpectedError())
            } else {
                const result = JSON.parse(httpRequestBody)
                if (result.error) {
                    logger.log('warn', result.error)
                    if (result.status === 400) reject(returnError.invalidImageFormat())
                    else reject(returnError.unexpectedErrorWhileClassifyingImage())
                } else resolve(result)
            }
        })
    })
}

/**
 * Examines the mimetype of a file and, if determined to be an accepted file type, buffers to base64
 * @param file {Object} - Object containing information needed for image (i.e., buffer, mimetype, etc.)
 * @returns {string|Error} - base64 string or an Error object
 */
const bufferToBase64 = (file) => {
    if (file && file.mimetype) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            return Buffer.from(file.buffer).toString('base64')
        } else throw returnError.invalidImageFormat()
    } else throw returnError.incompleteArguments()
}

/**
 * Handles uploading image, which mostly includes validating the file, converting to base64, making a HTTP POST, etc.
 * @param file {Object} - Object containing information needed for image (i.e., buffer, mimetype, etc.)
 * @param userId {string} - user's id
 * @param token {string} - JWT of authenticated user
 * @returns {Promise} - Promise representing if posting to "classify-image" was successful
 */
async function handleUploadingImage(file, userId, token) {
    if (file && token) {
        try {
            const base64 = bufferToBase64(file)
            return await postClassifyImage(base64, userId, token)
        } catch (error) {
            if (error.code && error.code === 400) throw returnError.invalidImageFormat()
            else throw returnError.unexpectedErrorWhileClassifyingImage()
        }
    } else throw returnError.incompleteArguments()
}

module.exports = {
    uploadImage: handleUploadImageRoute
}
