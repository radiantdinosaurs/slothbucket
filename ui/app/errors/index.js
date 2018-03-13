'use strict'

module.exports = {
    resourceNotFound: () => {
        const error = new Error('Resource not found.')
        error.code = 404
        return error
    },
    unexpectedError: () => {
        const error = new Error('Unexpected error. Please try again. If this issue continues, please report it as an ' +
            'issue.')
        error.code = 500
        return error
    },
    backendError: () => {
        const error = new Error('Backend error. Please try again. If this issue continues, please report it as an ' +
            'issue.')
        error.code = 500
        return error
    },
    invalidImageFormat: () => {
        const error = new Error('Invalid file format. Only PNG, JPEG, and JPG are accepted.')
        error.code = 400
        return error
    },
    unexpectedErrorWhileClassifyingImage: () => {
        const error = new Error('There was a problem while classifying the image. Please try again!')
        error.code = 500
        return error
    },
    incompleteArguments: () => {
        const error = new Error('The information you provided is incomplete or incorrect. Please try again.')
        error.code = 400
        return error
    }
}
