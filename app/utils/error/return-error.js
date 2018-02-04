'use strict'

module.exports = {
    resourceNotFound: function resourceNotFound() {
        const error = new Error('Resource not found')
        error.code = 404
        return error
    },
    internalError: function internalError() {
        const error = new Error('Internal error encountered. Please try again with a valid base64 string for a PNG or ' +
            'JPEG formatted as \'{\'base64\': \'(your base64 here)\'}}')
        error.code = 500
        return error
    },
    unexpectedError: function unexpectedError() {
        const error = new Error('Unexpected error. Please try again. If this issue continues, please report.')
        error.code = 500
        return error
    },
    invalidBase64Argument: function invalidArgumentError() {
        const error = new Error('Please supply a valid base64 string for a JPEG or PNG image.')
        error.code = 400
        return error
    },
    invalidFileFormat: function invalidFileFormat() {
        const error = new Error('File type isn\'t PNG, JPG, or JPEG. Only JPEG, JPG and PNG images are allowed.')
        error.code = 400
        return error
    },
    duplicateUserFound: function duplicateUserFound() {
        const error = new Error('Username or email already exists')
        error.code = 400
        return error
    },
    incorrectUsernameOrPassword: function incorrectUsernameOrPassword() {
        const error = new Error('Incorrect username or password')
        error.code = 400
        return error
    },
    generalInvalidArgument: function generalInvalidArgument() {
        const error = new Error('The information you provided is incomplete or incorrect . Please try again.')
        error.code = 400
        return error
    },
    failedAuthentication: function failedAuthentication() {
        const error = new Error('Failed to authenticate token')
        error.code = 500
        return error
    }
}
