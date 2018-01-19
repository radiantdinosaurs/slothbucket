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
 * Writes a file (from a base64 string) to disk
 * @param filename - name used to save file
 * @param base64 - base64 representation of the file
 * @returns {Promise} - Promise representing if file was saved
 */
function writeFile(filename, base64) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, base64, 'base64', (error) => {
            if (error) {
                logger.log('error', error)
                reject(error.internalError())
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
            logger.log('error')
            throw returnError.internalError()
        }
        return fileName
    } else throw returnError.invalidArgumentError()
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
                throw error
            } else throw returnError.internalError()
        }
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
            if (fileFormat.includes('jpeg')) resolve(handleWritingJpegToDisk(base64, fileName))
            else if (fileFormat.includes('png')) resolve(handleWritingPngToDisk(base64, fileName))
            else throw returnError.invalidArgumentError()
        } else throw returnError.invalidArgumentError()
    })
}

module.exports.writeFileToDisk = handleWriteFileRequest
