'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
process.env.SECRET = 'secret'
mute(process.stderr)

// mocked dependencies ==================
let expectedError
const request = {
    file: {
        mimetype: undefined,
        buffer: undefined
    },
    session: {
        jwt: undefined
    }
}
const result = {
    status: undefined,
    page: undefined,
    message: undefined
}
const response = {
    render: (page, message) => {
        result.page = page
        result.message = message
    },
    redirect: (page) => {
        result.page = page
    },
    status: function(responseStatus) {
        return this
    }
}
const validatingResponse = (expectedMessage) => {
    let responseObject = {
        render: (page, message) => {
            response.render(page, message)
            expect(result.message).to.deep.equal(expectedMessage)
        }
    }
    let that = responseObject
    responseObject.status = (status) => {
        response.status(status)
        return that
    }
    return responseObject
}
const next = (message) => {
    expect(message).to.deep.include(expectedError)
}
const mockReturnError = {
    invalidImageFormat: () => new Error('invalid'),
    unexpectedError: () => new Error('unexpected'),
    unexpectedErrorWhileClassifyingImage: () => new Error('unexpected error while classifying'),
    incompleteArguments: () => new Error('incomplete')
}
const mockHttpRequest = {
    post: undefined
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    'request': mockHttpRequest
})

// scenarios ============================
describe('Upload Image Controller', () => {
    describe('handleUploadImageRoute', () => {
        it('sends a response if the file mimetype is not JPEG or PNG', (done) => {
            const expectedMessage = { page: 'Slothbucket', errors: [{ msg: 'invalid' }] }
            request.file.mimetype = 'wrong'
            request.session.jwt = 'jwt'
            request.session.userId = 'id'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('calls next to send an error if the HTTP POST request fails', (done) => {
            mockHttpRequest.post = (data, callback) => callback(null, new Error('fail'))
            expectedError = new Error('unexpected error')
            controller.uploadImage[1](request, response, next)
            done()
        })
        it('sends a response if HTTP POST returns a message saying that the file type is invalid', (done) => {
            const expectedMessage = 'invalid format'
            const postImageResult = { error: 'invalid format', status: 400 }
            mockHttpRequest.post = (data, callback) => callback(null, postImageResult)
            request.file.mimetype = 'image/jpeg'
            request.session.jwt = 'jwt'
            request.file.buffer = '<Buffer 89 65 78>'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('sends a response if HTTP POST results in a renderable error', (done) => {
            const expectedMessage = 'unexpected error while classifying'
            const postImageResult = { error: 'error' }
            mockHttpRequest.post = (data, callback) => callback(null, postImageResult)
            request.file.mimetype = 'image/jpeg'
            request.session.jwt = 'jwt'
            request.file.buffer = '<Buffer 89 65 78>'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('sends a response if HTTP POST classifies the image as not containing a sloth', (done) => {
            const expectedMessage = { page: 'Slothbucket', contains_sloth: 'There\'s no sloth!' }
            const postImageResult = { 'sloth check': { contains_sloth: false } }
            mockHttpRequest.post = (data, callback) => callback(null, postImageResult)
            request.file.mimetype = 'image/jpeg'
            request.session.jwt = 'jwt'
            request.file.buffer = '<Buffer 89 65 78>'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
    })
})
