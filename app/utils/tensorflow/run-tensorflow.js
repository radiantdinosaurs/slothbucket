'use strict'

const returnError = require('../error/return-error')
const tensorflow = require('./tensorflow-client.js')

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
        } else throw (returnError.invalidArgumentError())
    } else throw (returnError.invalidArgumentError())
}

module.exports.classifyImage = classifyImage
