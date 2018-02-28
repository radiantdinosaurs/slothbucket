'use strict'

const fs = require('fs')
const path = require('path')
const pngToJpeg = require('png-to-jpeg')
const Buffer = require('safe-buffer').Buffer
const uuid = require('uuid').v4
const returnError = require('../errors/index')
const logger = require('../logging/index')

/**
 * Generates a UUID JPEG file name
 * @returns {string} - UUID JPEG file name
 */
function generateFileName() {
    return uuid() + '.jpeg'
}

/**
 * Validates a file format by analyzing the file signature (i.e., 'magic numbers') encoded as base64
 * @param {string} base64 - base64 representing an image
 * @returns {string|Error} - validated file format or Error object
 * @throws {Error} - Error object
 */
function validateFileFormat(base64) {
    if (base64 && typeof base64 === 'string') {
        if (base64.substring(0, 4).includes('/9j/')) return 'jpeg'
        else if (base64.substring(0, 11).includes('iVBORw0KGgo')) return 'png'
        else throw returnError.invalidFileFormat()
    } else throw returnError.invalidBase64()
}

/**
 * Writes a file (from a base64 string) to disk
 * @param filename - name used to save file
 * @param base64 - base64 representation of the file
 * @returns {Promise} - Promise representing if file was saved
 */
function writeFile(filename, base64) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path.join('saved_images/', filename), base64, 'base64', (error) => {
            if (error) {
                logger.log('error', error)
                reject(returnError.internalError())
            } else resolve()
        })
    })
}

/**
 * Handles writing base64 (for JPEG) to disk
 * @param {string} base64 - base64 string (for JPEG)
 * @param {string} fileName - unique file name
 * @returns {string} fileName - unique file name for image saved to disk
 * @throws {Error} - Error object
 */
async function handleWritingJpegToDisk(base64, fileName) {
    if (base64 && fileName) {
        try {
            await writeFile(fileName, base64)
        } catch (error) {
            // TODO: Find a way to let the user know when their image is simply corrupt
            logger.log('error')
            throw returnError.internalError()
        }
        return fileName
    } else throw returnError.incompleteArguments()
}

/**
 * Handles writing base64 (for PNG) to disk as JPEG
 * @param {string} base64 - base64 string (for PNG)
 * @param {string} fileName - unique file name
 * @returns {string} fileName - unique file name for image saved to disk
 * @throws {Error} - Error object
 */
async function handleWritingPngToDisk(base64, fileName) {
    if (base64 && fileName) {
        try {
            const buffer = new Buffer(base64, 'base64')
            const output = await pngToJpeg({quality: 90})(buffer)
            await writeFile(fileName, output)
        } catch (error) {
            if (error instanceof Error) {
                logger.log('error', error)
                throw returnError.corruptImage()
            } else throw returnError.internalError()
        }
        return fileName
    } else throw returnError.incompleteArguments()
}

/**
 * Walks through the correct functions to write a base64-encoded file to disk
 * @param base64 - base64 representing an image
 * @returns {Promise} - Promise object representing if the file saved to disk successfully
 * @throws {Error} - Error object
 */
function handleWriteFileRequest(base64) {
    return new Promise((resolve) => {
        if (base64 && typeof base64 === 'string') {
            let fileName = generateFileName()
            const fileFormat = validateFileFormat(base64)
            if (fileFormat.includes('jpeg')) resolve(handleWritingJpegToDisk(base64, fileName))
            else if (fileFormat.includes('png')) resolve(handleWritingPngToDisk(base64, fileName))
            else throw returnError.invalidBase64()
        } else throw returnError.invalidBase64()
    })
}

module.exports = {
    handleWriteFile: handleWriteFileRequest
}
