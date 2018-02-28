'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
mute(process.stderr)

// mocked dependencies ==================
const result = {
    status: undefined,
    message: undefined
}
const request = {
    body: {
        base64: undefined,
        user_id: undefined
    }
}
const response = {
    send: (message) => {
        result.message = message
    },
    status: function status() {
        return this
    },
    locals: {
        tensorFlowResult: undefined,
        fileName: undefined,
        userId: undefined
    }
}
const mockReturnError = {
    incompleteRequest: () => new Error('incomplete request'),
    internalError: () => new Error('internal error')
}
const mockWriteFile = {
    handleWriteFile: undefined
}
const mockTensorflow = {
    classifyImage: undefined
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    '../write_file/index': mockWriteFile
})

// scenarios ============================
describe('Classify Image Controller', () => {
    describe('handleClassifyImage', () => {
        it('sends a response if request body\'s base64 is not specified', (done) => {
            const expectedError = new Error('incomplete request')
            const next = (message) => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassifyImage[0](request, response, next)
        })
        it('sends a response if request body\'s user_id is not specified', (done) => {
            const expectedError = new Error('incomplete request')
            const next = (message) => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassifyImage[0](request, response, next)
        })
        it('sends a response if writing file is unsuccessful', (done) => {
            request.body.base64 = 'base64'
            request.body.user_id = 'user_id'
            mockWriteFile.handleWriteFile = () => new Promise((resolve, reject) => reject(new Error('fail')))
            const expectedError = new Error('fail')
            const next = (message) => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassifyImage[0](request, response, next)
        })
        it('sends a response if running tensorflow is unsuccessful', (done) => {
            request.body.base64 = 'base64'
            request.body.user_id = 'user_id'
            mockWriteFile.handleWriteFile = () => new Promise((resolve) => resolve('filename'))
            mockTensorflow.classifyImage = () => new Promise((resolve, reject) => {
                const error = new Error('fail')
                error.code = 500
                reject(error)
            })
            const expectedError = new Error('internal error')
            const next = (message) => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassifyImage[0](request, response, next)
        })
        it('sends a response if response.local variables do not exist', (done) => {
            const expectedError = new Error('internal error')
            const next = (message) => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassifyImage[1](request, response, next)
        })
        // TODO: test the second part of handleClassifyImage
    })
})
