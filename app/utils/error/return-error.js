/**
 * Creates an Error with code 400 for invalid arguments
 * @returns {Error} - Error object
 */
function invalidArgumentError() {
    const error = new Error('Please supply a valid base64 string for a JPEG or PNG image.')
    error.code = 400
    return error
}

/**
 * Creates an Error with code 500 for internal errors
 * @returns {Error} - Error object
 */
function internalError() {
    const error = new Error('Internal error encountered. Please try again with a valid base64 string for a PNG or ' +
        'JPEG formatted as \'{\'base64\': \'(your base64 here)\'}}')
    error.code = 500
    return error
}

/**
 * Creates an Error with code 400 for invalid file formats
 * @returns {Error} - Error object
 */
function invalidFileFormat() {
    const error = new Error('File type isn\'t PNG, JPG, or JPEG. Only JPEG, JPG and PNG images are allowed.')
    error.code = 400
    return error
}

module.exports.invalidArgumentError = invalidArgumentError
module.exports.internalError = internalError
module.exports.invalidFileFormat = invalidFileFormat
