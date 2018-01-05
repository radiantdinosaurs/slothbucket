const fs = require('fs')
const pngToJpeg = require('png-to-jpeg')
const Buffer = require('safe-buffer').Buffer
const uuid = require('uuid/v4')
const parseBase64 = require('./parse-base64')

/**
 * Generates a UUID JPEG file name
 * @returns {string} - UUID JPEG file name
 */
const generateFileName = () => {
    return uuid() + '.jpeg'
}

/**
 * Writes base64 (for JPEG) to disk
 * @param {string} base64 - base64 string (for JPEG)
 * @param {string} fileName - unique file name
 * @returns {Promise} - Promise object representing the file name saved to disk
 */
const writeJpegToDisk = (base64, fileName) => {
    return new Promise((resolve, reject) => {
        if (base64 && fileName) {
            fs.writeFile(fileName, parseBase64.stripDataLabel(base64), 'base64', (error) => {
                if (error) {
                    reject(error)
                } else resolve(fileName)
            })
        } else {
            let error = new Error('Cannot write file to disk if arguments are undefined')
            error.code = 400
            reject(error)
        }
    })
}

/**
 * Writes base64 (for PNG) to disk as JPEG
 * @param {string} base64 - base64 string (for PNG)
 * @param {string} fileName - unique file name
 * @returns {Promise} - Promise object representing the file name saved to disk
 */
const writePngToDisk = (base64, fileName) => {
    return new Promise((resolve, reject) => {
        if (base64) {
            const buffer = new Buffer(base64.split(/,\s*/)[1], 'base64')
            pngToJpeg({quality: 90})(buffer).then((output) => {
                fs.writeFile(fileName, output, function(error) {
                    if (error) {
                        reject(error)
                    } else resolve(fileName)
                })
            })
        } else {
            let error = new Error('Cannot write file to disk if arguments are undefined')
            error.code = 400
            reject(error)
        }
    })
}

/**
 * Walks through the correct functions to write a file (from base64) to disk
 * @param base64 - base64 string
 * @returns {Promise|Error} - Promise object representing the file name saved to disk or Error object
 */
const handleWriteFileRequest = (base64) => {
    if (base64) {
        const fileName = generateFileName()
        const fileFormat = parseBase64.validateFileFormat(base64)
        if (fileFormat instanceof Error) return fileFormat
        else {
            if (fileFormat.includes('jpeg')) return writeJpegToDisk(base64, fileName)
            else if (fileFormat.includes('png')) return writePngToDisk(base64, fileName)
        }
    } else {
        let error = new Error('Cannot write file to disk if arguments are undefined')
        error.code = 400
        return error
    }
}

module.exports.writeFileToDisk = handleWriteFileRequest
