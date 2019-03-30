'use strict'

const imageController = require('../images/index')
const logger = require('../logging/index')
const fs = require('fs')
const returnError = require('../errors/index')

function handleImageLibraryRoute(request, response, next) {
    if (request.params.id) {
        const userId = request.params.id
        imageController
            .findImages(userId)
            .then(imagePathList => {
                imagePathList.reverse()
                processImageList(imagePathList)
                    .then(base64Images => {
                        response.status(200).send(base64Images)
                    })
                    .catch(error => {
                        logger.log('error', error)
                        next(error)
                    })
            })
            .catch(error => {
                logger.log('error')
                next(error)
            })
    } else next(returnError.incompleteRequest())
}

/**
 * Reads a file from the system
 * @param filePath {string} - location of a file
 * @returns {Promise} - Promise representing if reading the file was successful
 */
function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, function(error, data) {
            if (error) {
                logger.log('error', error)
                reject(returnError.internalError())
            } else resolve(data)
        })
    })
}

/**
 * Handles processing a list of images (e.g., reading the files, converting from buffer to base64, etc.)
 * @param imagePathList {array} - array of objects containing a list image paths
 * @returns {array} - array of objects containing a list of base64-encoded images
 */
async function processImageList(imagePathList) {
    if (imagePathList) {
        let base64Images = []
        for (const image of imagePathList) {
            const filePath = image.file_path
            const data = await readFile(filePath)
            base64Images.push({
                base64Image: Buffer.from(data).toString('base64')
            })
        }
        return base64Images
    } else throw returnError.incompleteArguments()
}

module.exports = {
    handleImageLibraryRoute: handleImageLibraryRoute
}
