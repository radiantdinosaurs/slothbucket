'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
process.env.SECRET = 'secret'
mute(process.stderr)

// mocked dependencies ==================
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
const mockReturnError = {
    generalInvalidArgument: () => 'invalid argument',
    invalidImageFormat: () => 'invalid format',
    unexpectedError: () => 'unexpected error',
    unexpectedErrorWhileClassifyingImage: () => 'unexpected error while classifying'
}
const mockHttpRequest = {
    post: undefined
}
let next = () => 'next'
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    'request': mockHttpRequest
})

// scenarios ============================
describe('Upload Image Controller', () => {
    describe('handleUploadImageRoute', () => {
        it('renders an error if file is undefined', (done) => {
            const expectedMessage = 'invalid argument'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('renders an error if JWT (token) is undefined', (done) => {
            const expectedMessage = 'invalid argument'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('renders an error if the file mimetype is undefined', (done) => {
            const expectedMessage = 'invalid argument'
            request.session.jwt = 'jwt'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('renders an error if the file mimetype is not JPEG or PNG', (done) => {
            const expectedMessage = 'invalid format'
            request.file.mimetype = 'wrong'
            request.session.jwt = 'jwt'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('"nexts" an error if posting to the API fails', (done) => {
            const expectedMessage = 'unexpected error while classifying'
            request.file.mimetype = 'image/jpeg'
            request.session.jwt = 'jwt'
            request.file.buffer = '<Buffer 89 65 78>'
            mockHttpRequest.post = (data, callback) => callback(new Error(), next)
            let next = (message) => {
                expect(message).to.deep.equal(expectedMessage)
                done()
            }
            controller.uploadImage[1](request, response, next)
        })
        it('renders an error if the API says the file type is invalid', (done) => {
            const expectedMessage = 'invalid format'
            const postImageResult = {error: 'invalid format', status: 400}
            mockHttpRequest.post = (data, callback) => callback(null, postImageResult)
            request.file.mimetype = 'image/jpeg'
            request.session.jwt = 'jwt'
            request.file.buffer = '<Buffer 89 65 78>'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('renders an error if posting the the API returns an error message', (done) => {
            const expectedMessage = 'unexpected error while classifying'
            const postImageResult = {error: 'error'}
            mockHttpRequest.post = (data, callback) => callback(null, postImageResult)
            request.file.mimetype = 'image/jpeg'
            request.session.jwt = 'jwt'
            request.file.buffer = '<Buffer 89 65 78>'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('resolves with \'contains_sloth\' if API returns a true result', (done) => {
            const expectedMessage = {page: 'Slothbucket', contains_sloth: 'Contains a sloth!'}
            const postImageResult = {'sloth check': {contains_sloth: true}}
            mockHttpRequest.post = (data, callback) => callback(null, postImageResult)
            request.file.mimetype = 'image/jpeg'
            request.session.jwt = 'jwt'
            request.file.buffer = '<Buffer 89 65 78>'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
        it('resolves with \'contains_sloth\' if API returns a false result', (done) => {
            const expectedMessage = {page: 'Slothbucket', contains_sloth: 'There\'s no sloth!'}
            const postImageResult = {'sloth check': {contains_sloth: false}}
            mockHttpRequest.post = (data, callback) => callback(null, postImageResult)
            request.file.mimetype = 'image/jpeg'
            request.session.jwt = 'jwt'
            request.file.buffer = '<Buffer 89 65 78>'
            controller.uploadImage[1](request, validatingResponse(expectedMessage), next)
            done()
        })
    })
})
