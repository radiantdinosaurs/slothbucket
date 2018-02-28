'use strict'

const logger = require('../logging/index')
const Image = require('./image')
const returnError = require('../errors/index')

/**
 * Saves the file path and user's id for an image
 * @param imageData {Object} - Object containing the image data (i.e., file path, user's id)
 * @returns {Promise} - Promise representing if image was saved to the database successfully
 */
function saveImage(imageData) {
    return new Promise((resolve, reject) => {
        Image.create(imageData, (error, image) => {
            if (error) {
                logger.log('error', error)
                reject(returnError.internalError())
            } else resolve(image)
        })
    })
}

/**
 * Finds all images belonging to the user's id
 * @param userId {string} - user's id
 * @returns {Promise} - Promise representing if finding images was successful
 */
function findImages(userId) {
    return new Promise((resolve, reject) => {
        Image.find({user_id: userId}).exec(function(error, images) {
            if (error) {
                logger.log('error', error)
                reject(returnError.internalError())
            } else {
                resolve(images)
            }
        })
    })
}

module.exports = {
    saveImage: saveImage,
    findImages: findImages
}
