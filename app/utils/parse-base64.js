/**
 * Validates a file format by analyzing the data label (the first 15 characters of a base64 string)
 * @param {string} base64 - base64 string
 * @returns {string|Error} - validated file format or Error object
 */
const validateFileFormat = (base64) => {
    if (base64) {
        if (base64.substring(0, 15).includes('jpeg')) return 'jpeg'
        else if (base64.substring(0, 15).includes('png')) return 'png'
        else {
            let error = new Error('File type isn\'t PNG or JPEG. Only JPEG and PNG images are allowed.')
            error.code = 400
            return error
        }
    } else {
        let error = new Error('Cannot validate file format if argument is undefined')
        error.code = 400
        return error
    }
}

/**
 * Strips data label from a base64 string
 * @param base64 - base64 string
 * @returns {string|Error} - stripped base64 or Error object
 */
const stripDataLabel = (base64) => {
    return base64.replace(/^data:image\/jpeg;base64,/, '')
}

module.exports.validateFileFormat = validateFileFormat
module.exports.stripDataLabel = stripDataLabel
