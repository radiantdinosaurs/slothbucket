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
let expectedMessage
const result = {
    status: undefined,
    page: undefined,
    message: undefined
}
const request = {
    session: {
        userId: 'id',
        jwt: 'jwt'
    }
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
    backendError: () => 'backend error'
}
const mockHttpRequest = {
    get: undefined
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    'request': mockHttpRequest
})

// scenarios ============================
describe('Image Library Controller', () => {
    describe('handleImageLibraryRoute', () => {
        it('calls next to send an error if the HTTP request fails', (done) => {
            mockHttpRequest.get = (data, callback) => callback(null, new Error('fail'))
            expectedError = new Error('backend error')
            controller.handleImageLibraryRoute(request, response, next)
            done()
        })
        it('calls next to send an error if the HTTP request sends an error message', (done) => {
            mockHttpRequest.get = (data, callback) => {
                const error = { error: 'fail' }
                callback(null, error)
            }
            expectedError = new Error('backend error')
            controller.handleImageLibraryRoute(request, response, next)
            done()
        })
        it('sends a response if the user\'s image list is empty', (done) => {
            mockHttpRequest.get = (data, callback) => {
                const images = []
                callback(null, images)
            }
            expectedMessage = { page: 'Slothbucket', errors: [{ msg: 'You don\'t have any images yet!' }] }
            controller.handleImageLibraryRoute(request, validatingResponse(expectedMessage), next)
            done()
        })
        it('sends a response if the user\'s image list has at least one image', (done) => {
            mockHttpRequest.get = (data, callback) => {
                const images = [{ base64Image: '1' }]
                callback(null, images)
            }
            expectedMessage = { page: 'Slothbucket', images: { base64Image: '1' } }
            controller.handleImageLibraryRoute(request, validatingResponse(expectedMessage), next)
            done()
        })
    })
})
