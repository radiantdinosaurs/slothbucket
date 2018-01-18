const fs = require('fs')
const pngToJpeg = require('png-to-jpeg')
const Buffer = require('safe-buffer').Buffer
const uuid = require('uuid').v4
const returnError = require('../error/return-error')
const winston = require('winston')
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'error',
            colorize: true,
            timestamp: true,
            silent: false
        })
    ]
})

/**
 * Generates a UUID JPEG file name
 * @returns {string} - UUID JPEG file name
 */
function generateFileName() {
    return uuid() + '.jpeg'
}

/**
 * Validates a file format by analyzing the file signature (i.e., 'magic numbers') encoded as base64
 * @param {string} base64 - base64 string
 * @returns {string|Error} - validated file format or Error object
 * @throws {Error} - Error object
 */
function validateFileFormat(base64) {
    if (base64 && typeof base64 === 'string') {
        if (base64.substring(0, 4).includes('/9j/')) return 'jpeg'
        else if (base64.substring(0, 11).includes('iVBORw0KGgo')) return 'png'
        else throw returnError.invalidFileFormat()
    } else throw returnError.invalidArgumentError()
}

/**
 * Writes base64 (for JPEG) to disk
 * @param {string} base64 - base64 string (for JPEG)
 * @param {string} fileName - unique file name
 * @returns {string} fileName - unique file name for image saved to disk
 * @throws {Error} - Error object
 */
async function writeJpegToDisk(base64, fileName) {
    if (base64 && fileName) {
        await fs.writeFile(fileName, base64, 'base64', (error) => {
            if (error) {
                logger.log('error', error)
                throw returnError.internalError()
            }
        })
        return fileName
    } else throw returnError.invalidArgumentError()
}

/**
 * Writes base64 (for PNG) to disk as JPEG
 * @param {string} base64 - base64 string (for PNG)
 * @param {string} fileName - unique file name
 * @returns {string} fileName - unique file name for image saved to disk
 * @throws {Error} - Error object
 */
async function writePngToDisk(base64, fileName) {
    if (base64 && fileName) {
        const buffer = new Buffer(base64, 'base64')
        await pngToJpeg({quality: 90})(buffer).then((output) => {
            fs.writeFile(fileName, output, (error) => {
                if (error) {
                    logger.log('error', error)
                    throw error.internalError()
                }
            })
        }).catch((error) => {
            if (error instanceof Error) {
                logger.log('error', error)
                throw error
            } else throw returnError.internalError()
        })
        return fileName
    } else throw returnError.invalidArgumentError()
}

/**
 * Walks through the correct functions to write a file (from base64) to disk
 * @param base64 - base64 string
 * @returns {Promise} - Promise object representing the file name saved to disk
 * @throws {Error} - Error object
 */
function handleWriteFileRequest(base64) {
    return new Promise((resolve) => {
        if (base64 && typeof base64 === 'string') {
            let fileName = generateFileName()
            const fileFormat = validateFileFormat(base64)
            if (fileFormat.includes('jpeg')) resolve(writeJpegToDisk(base64, fileName))
            else if (fileFormat.includes('png')) resolve(writePngToDisk(base64, fileName))
            else throw returnError.invalidArgumentError()
        } else throw returnError.invalidArgumentError()
    })
}

module.exports.writeFileToDisk = handleWriteFileRequest
