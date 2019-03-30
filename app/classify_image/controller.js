'use strict'

const returnError = require('../errors/index')
const tensorflow = require('./tensorflow-client.js')
const writeFile = require('../write_file/index')
const deleteFile = require('../delete_file/index')
const logger = require('../logging/index')
const parseTensorFlow = require('./parse-tensorflow')
const imageController = require('../images/index')

// handles the HTTP POST for the route /classify
const handleClassifyRoute = [
    (request, response, next) => {
        if (request.body.user_id && request.body.base64) {
            const base64 = request.body.base64
            writeFile
                .handleWriteFile(base64)
                .then(fileName => {
                    response.locals.fileName = fileName
                    return classifyImage(fileName)
                })
                .then(tensorFlowResult => {
                    response.locals.tensorFlowResult = parseTensorFlow.parseTensorFlowResult(
                        tensorFlowResult
                    )
                    response.locals.userId = request.body.user_id
                    next()
                })
                .catch(error => {
                    if (error.code === 500) logger.log('error', error)
                    else logger.log('error', error)
                    next(error)
                })
        } else next(returnError.incompleteRequest())
    },
    (request, response, next) => {
        if (
            response.locals.tensorFlowResult &&
            response.locals.fileName &&
            response.locals.userId
        ) {
            const tensorFlowResult = response.locals.tensorFlowResult
            const fileName = response.locals.fileName
            const userId = response.locals.userId
            if (tensorFlowResult['sloth_check'].contains_sloth) {
                const filePath = 'saved_images/' + fileName
                const imageData = {
                    file_path: filePath,
                    user_id: userId
                }
                imageController
                    .saveImage(imageData)
                    .then(() => response.status(200).send(tensorFlowResult))
                    .catch(error => {
                        logger.log('error', error)
                        response
                            .status(error.code)
                            .send({ status: error.code, error: error.message })
                    })
            } else response.status(200).send(tensorFlowResult)
        } else next(returnError.internalError())
    }
]

/**
 * Handles the HTTP POST route for `/classify-demo`
 * @param {Object} request - the HTTP request
 * @param {Object} response - the HTTP response
 * @param {callback function} next - passes control to the next middleware function
 */
const handleClassifyDemoRoute = (request, response, next) => {
    if (request.body.base64) {
        const base64 = request.body.base64
        let file
        writeFile
            .handleWriteFile(base64)
            .then(fileName => {
                file = fileName
                return classifyImage(fileName)
            })
            .then(tensorFlowResult => {
                tensorFlowResult = parseTensorFlow.parseTensorFlowResult(
                    tensorFlowResult
                )
                response.status(200).send(tensorFlowResult)
            })
            .catch(error => {
                if (error.code === 500) logger.log('error', error)
                else logger.log('error', error)
                next(error)
            })
            .finally(() => {
                deleteFile.deleteFileIfExists(file)
            })
            .catch(error => logger.log('error', error))
    } else next(returnError.incompleteRequest())
}

/**
 * Handles classifying an image with a trained TensorFlow model
 * @param {string} fileName - name of the image to classify
 * @returns {Promise} - Promise object representing if TensorFlow was successful in classifying the image
 * @throws {Error} - Error object
 */
async function classifyImage(fileName) {
    if (fileName) {
        if (
            typeof fileName === 'string' &&
            (fileName.includes('.jpeg') || fileName.includes('.png'))
        ) {
            return tensorflow.classifyImage(fileName)
        } else throw returnError.internalError()
    } else throw returnError.internalError()
}

module.exports = {
    handleClassify: handleClassifyRoute,
    handleClassifyDemo: handleClassifyDemoRoute
}
