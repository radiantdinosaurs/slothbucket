const child_process = require('child_process')
const returnError = require('../error/return-error')

/**
 * Classifies an image via a trained TensorFlow model
 * @param {string} fileName - name of the file to classify
 * @returns {Promise} - Promise object representing command line output from the trained model
 * @throws {Error} - Error object
 */
const classifyImage = (fileName) => {
    return new Promise((resolve, reject) => {
        if (fileName) {
            if (typeof fileName === 'string' && (fileName.includes('.jpeg') || fileName.includes('.png'))) {
                const filePath = '../slothbucket/' + fileName
                // execute classify_image.py on the image file at the given file path
                child_process.execFile('python', ['classify_image.py', '--image_file', filePath], {
                    cwd: '../root' // change working directory
                }, (error, result) => {
                    if (error) reject(returnError.internalError())
                    else resolve(result)
                })
            } else throw (returnError.invalidArgumentError())
        } else throw (returnError.invalidArgumentError())
    })
}

module.exports.classifyImage = classifyImage
