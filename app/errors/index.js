'use strict'

module.exports = {
    resourceNotFound: () => {
        const error = new Error('Resource not found.')
        error.code = 404
        return error
    },
    unexpectedError: () => {
        const error = new Error('Unexpected error. Please try again. If this problem persists, please report ' +
            'it as an issue at https://github.com/radiantdinosaurs/slothbucket/issues')
        error.code = 500
        return error
    },
    internalError: () => {
        const error = new Error('Internal error encountered. Please try again. If this problem persists, please ' +
            'report it as an issue at https://github.com/radiantdinosaurs/slothbucket/issues')
        error.code = 500
        return error
    },
    invalidFileFormat: () => {
        const error = new Error('File type isn\'t PNG, JPG, or JPEG. Only JPEG, JPG and PNG images are allowed.')
        error.code = 400
        return error
    },
    corruptImage: () => {
        const error = new Error('Corrupt image. Please try again with a complete, valid base64 string for a PNG ' +
            'or JPEG.')
        error.code = 400
        return error
    },
    invalidBase64: () => {
        const error = new Error('Invalid base64. Please supply a valid base64 string for a JPEG or PNG image.')
        error.code = 400
        return error
    },
    incompleteRequest: () => {
        const error = new Error('The request you provided is incomplete. Please refer to documentation at ' +
            'https://github.com/radiantdinosaurs/slothbucket to get set up.')
        error.code = 400
        return error
    },
    incompleteArguments: () => {
        const error = new Error('Missing required information. Request could not process.')
        error.code = 418
        return error
    },
    failedTokenAuthentication: () => {
        const error = new Error('Failed to authenticate your token.')
        error.code = 401
        return error
    },
    incorrectUsernameOrPassword: () => {
        const error = new Error('Incorrect username or password.')
        error.code = 400
        return error
    },
    duplicateUserFound: () => {
        const error = new Error('Username or email already exists.')
        error.code = 400
        return error
    }
}
