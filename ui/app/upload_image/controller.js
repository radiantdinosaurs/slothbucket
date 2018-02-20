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
        const file = request.file
        const token = request.session.jwt
        handlePostingImageToAPI(file, token).then((result) => {
            if (result['sloth_check'].contains_sloth) {
                response.status(200).render('index', {page: 'Slothbucket', contains_sloth: 'Contains a sloth!'})
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
 * Walks through all the needed functions and checks to post an image to Slothbucket's 'classify-image' route
 * @param file {Object} - Object representing a file
 * @param token {string} - JWT of authenticated user
 * @returns {Promise} - Promise representing if posting to Slothbucket was successful
 */
async function handlePostingImageToAPI(file, token) {
    return new Promise((resolve) => {
        if (file && token) {
            const base64Image = validateImageAndBufferToBase64(file)
            resolve(handleHttpPost(base64Image, token))
        } else throw returnError.generalInvalidArgument()
    })
}

/**
 * Examines the mimetype of a file and, if determined an accepted filetype, buffers to base64
 * @param image {Object} - Object representing a file
 * @returns {string|Error} - base64 image string or Error object
 */
const validateImageAndBufferToBase64 = (image) => {
    if (image && image.mimetype) {
        if (image.mimetype === 'image/jpeg' || image.mimetype === 'image/png') {
            return Buffer.from(image.buffer).toString('base64')
        } else throw returnError.invalidImageFormat()
    } else throw returnError.generalInvalidArgument()
}

/**
 * Handles posting to Slothbucket's 'classify-image' route
 * @param base64Image {string} - base64 image
 * @param token {string} - JWT of authenticated user
 * @returns {Promise} - Promise representing if posting to the route was successful
 */
async function handleHttpPost(base64Image, token) {
    if (base64Image && token) {
        try {
            return await httpPostClassifyImage(base64Image, token)
        } catch (error) {
            if (error.code && error.code === 400) throw returnError.invalidImageFormat()
            else throw returnError.unexpectedErrorWhileClassifyingImage()
        }
    } else throw returnError.generalInvalidArgument()
}

/**
 * Posts to Slothbucket's 'classify-image' route with an base64 image and JWT
 * @param base64Image {string} - base64 image
 * @param token {string} - JWT of authenticated user
 * @returns {Promise} - Promise representing if posting to the route was successful
 */
function httpPostClassifyImage(base64Image, token) {
    return new Promise((resolve, reject) => {
        const options = {
            url: 'http://localhost:8000/classify-image',
            headers: {'x-access-token': token},
            form: {base64: base64Image}
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

module.exports = {
    uploadImage: handleUploadImageRoute
}
