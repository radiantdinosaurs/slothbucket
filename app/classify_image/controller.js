'use strict'

const returnError = require('../errors/index')
const tensorflow = require('./tensorflow-client.js')
const writeFile = require('../write_file/index')
const logger = require('../logging/index')
const parseTensorFlow = require('./parse-tensorflow')

// handler for classifying images
const handleClassifyImageRoute = (request, response) => {
    const base64 = request.body.base64
    if (base64) {
        // first, write the file to disk
        writeFile.handleWriteFile(base64).then((fileName) => {
            // next, run TensorFlow's trained model
            classifyImage(fileName).then((tensorFlowResult) => {
                // finally, send the result
                response.status(200).send(parseTensorFlow.parseTensorFlowResult(tensorFlowResult))
            }).catch(error => {
                if (error.code === 500) logger.log('error', error)
                else logger.log('warn', error)
                response.status(error.code)
                    .send({status: error.code, error: 'Internal error encountered. Please try again.'})
            })
        }).catch(error => {
            if (error.code === undefined) error.code = 500
            if (error.code === 500) logger.log('error', error)
            else logger.log('warn', error)
            response.status(error.code).send({status: error.code, error: error.message})
        })
    } else {
        response.status(400).send({status: 400,
            error: 'Cannot read undefined body. Format as \'{\'base64\': \'(your base64 here)\'}\'.'})
    }
}

/**
 * Classifies an image via a trained TensorFlow model
 * @param {string} fileName - name of the file to classify
 * @returns {Promise} - Promise object representing command line output from the trained model
 * @throws {Error} - Error object
 */
async function classifyImage(fileName) {
    if (fileName) {
        if (typeof fileName === 'string' && (fileName.includes('.jpeg') || fileName.includes('.png'))) {
            return tensorflow.classifyImage(fileName)
        } else throw (returnError.invalidBase64Argument())
    } else throw (returnError.invalidBase64Argument())
}

module.exports = {
    handleClassifyImage: handleClassifyImageRoute
}
