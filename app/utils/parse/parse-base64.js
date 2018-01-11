const returnError = require('../error/return-error')

/**
 * Strips data label from a base64 string
 * @param base64 - base64 string
 * @returns {string} - stripped base64
 * @throws {Error} - Error object
 */
const stripDataLabel = (base64) => {
    if (base64 && typeof base64 === 'string') {
        if (base64.substring(0, 15).includes('jpeg')) return base64.replace(/^data:image\/jpeg;base64,/, '')
        else if (base64.substring(0, 15).includes('png')) return base64.replace(/^data:image\/png;base64,/, '')
        else throw returnError.invalidArgumentError()
    } else throw returnError.invalidArgumentError()
}

module.exports.stripDataLabel = stripDataLabel
