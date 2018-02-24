'use strict'

const multer = require('multer')
const returnError = require('../errors/index')
const logger = require('../logging/index')
const httpRequest = require('request')
const uploadFile = multer({
    destination: './',
    limits: {
        fileSize: 5000000 // limit file size to 5MB
    }
})

// handler for uploading an image
const handleUploadImageRoute = [
    uploadFile.single('file'),
    (request, response, next) => {
        const token = request.session.jwt
        const file = request.file
        handleUploadingImage(file, token).then((image) => {
            const base64 = image.base64
            if (image['sloth_check'].contains_sloth) {
                // TODO: upon setting up a relational table, we can next or redirect to a page that will load all
                // of the user's pictures, including the one just uploaded
                response.status(200).render('index', {
                    page: 'Slothbucket',
                    contains_sloth: 'Contains a sloth!',
                    images: [{base64Image: base64}]})
            } else {
                response.status(200).render('index', {page: 'Slothbucket', contains_sloth: 'There\'s no sloth!'})
            }
        }).catch((error) => {
            if (error.code && error.code === 400) {
                response.status(200).render('index', {page: 'Slothbucket', errors: [{msg: error.message}]})
            } else next(error)
        })
    }
]

/**
 * Posts to Slothbucket's "classify-image" route
 * @param base64 {string} - base64 image
 * @param token {string} - JWT of authenticated user
 * @returns {Promise} - Promise representing if posting to the route was successful
 */
function uploadImage(base64, token) {
    return new Promise((resolve, reject) => {
        const options = {
            url: 'http://localhost:8000/classify-image',
            headers: {'x-access-token': token},
            form: {base64: base64}
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
                } else {
                    result.base64 = base64
                    resolve(result)
                }
            }
        })
    })
}

/**
 * Examines the mimetype of a file and, if determined an accepted file type, buffers to base64
 * @param image {Object} - Object representing an image file
 * @returns {string|Error} - base64 string or an Error object
 */
const validateImageAndBufferToBase64 = (image) => {
    if (image && image.mimetype) {
        if (image.mimetype === 'image/jpeg' || image.mimetype === 'image/png') {
            return Buffer.from(image.buffer).toString('base64')
        } else throw returnError.invalidImageFormat()
    } else throw returnError.generalInvalidArgument()
}

/**
 * Handles posting to Slothbucket's "classify-image" route
 * @param file {Object} - Object representing an image file
 * @param token {string} - JWT of authenticated user
 * @returns {Promise} - Promise representing if posting to the route was successful
 */
async function handleUploadingImage(file, token) {
    if (file && token) {
        try {
            const base64 = validateImageAndBufferToBase64(file)
            return await uploadImage(base64, token)
        } catch (error) {
            if (error.code && error.code === 400) throw returnError.invalidImageFormat()
            else throw returnError.unexpectedErrorWhileClassifyingImage()
        }
    } else throw returnError.generalInvalidArgument()
}

module.exports = {
    uploadImage: handleUploadImageRoute
}
