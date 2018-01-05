const child_process = require('child_process')

/**
 * Classifies an image via a trained TensorFlow model
 * @param {string} fileName - name of the file to classify
 * @returns {Promise} - Promise object representing command line output from the trained model
 */
const classifyImage = (fileName) => {
    const filePath = '../slothbucket/' + fileName
    return new Promise((resolve, reject) => {
        // execute classify_image.py on the image file at the given file path
        child_process.execFile('python', ['classify_image.py', '--image_file', filePath], {
            cwd: '../root' // change working directory
        }, function(error, result) {
            if (error) {
                reject(error)
            } else resolve(result)
        })
    })
}

module.exports.classifyImage = classifyImage
