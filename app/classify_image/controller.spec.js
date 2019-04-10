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
const emptyRequest = {
    body: {
        base64: undefined,
        user_id: undefined
    }
}
const populatedRequest = {
    body: {
        base64: 'base64',
        user_id: 'user_id'
    }
}
const response = {
    send: message => {
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
const mockDeleteFile = {
    deleteFileIfExists: undefined
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    '../write_file/index': mockWriteFile,
    '../delete_file/index': mockDeleteFile
})

// scenarios ============================
describe('Classify Image Controller', () => {
    describe('handleClassify', () => {
        it('sends a response if request body base64 is not specified', done => {
            const expectedError = new Error('incomplete request')
            const next = message => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassify[0](emptyRequest, response, next)
        })

        it('sends a response if request body user_id is not specified', done => {
            const expectedError = new Error('incomplete request')
            const next = message => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassify[0](emptyRequest, response, next)
        })

        it('sends a response if writing file is unsuccessful', done => {
            mockWriteFile.handleWriteFile = () =>
                new Promise((resolve, reject) => reject(new Error('fail')))
            const expectedError = new Error('fail')
            const next = message => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassify[0](populatedRequest, response, next)
        })

        it('sends a response if running tensorflow is unsuccessful', done => {
            mockWriteFile.handleWriteFile = () =>
                new Promise(resolve => resolve('filename'))
            mockTensorflow.classifyImage = () =>
                new Promise((resolve, reject) => {
                    const error = new Error('fail')
                    error.code = 500
                    reject(error)
                })
            const expectedError = new Error('internal error')
            const next = message => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassify[0](populatedRequest, response, next)
        })

        it('sends a response if response.local variables do not exist', done => {
            const expectedError = new Error('internal error')
            const next = message => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassify[1](populatedRequest, response, next)
        })
    })
    describe('handleClassifyDemo', () => {
        it('sends a response if request body base64 is not specified', done => {
            const expectedError = new Error('incomplete request')
            const next = message => {
                expect(message).to.deep.include(expectedError)
                done()
            }
            controller.handleClassifyDemo(emptyRequest, response, next)
        })

        it('sends a response if writing file is unsuccessful', done => {
            let expectedErrorMessage
            const expectedError = new Error('Failure in `handleWriteFile`')
            mockWriteFile.handleWriteFile = () => {
                return Promise.reject(new Error('Failure in `handleWriteFile`'))
            }
            mockDeleteFile.deleteFileIfExists = file => {
                expect(file).to.be.an('undefined')
                expect(expectedErrorMessage).to.deep.include(expectedError)
                done()
            }

            const next = message => (expectedErrorMessage = message)

            controller.handleClassifyDemo(populatedRequest, response, next)
        })

        it('sends a response if running tensorflow is unsuccessful', done => {
            let expectedErrorMessage
            const expectedError = new Error('internal error')
            mockWriteFile.handleWriteFile = () => Promise.resolve('filename')
            mockTensorflow.classifyImage = () =>
                new Promise((resolve, reject) => {
                    const error = new Error('fail')
                    error.code = 500
                    reject(error)
                })
            mockDeleteFile.deleteFileIfExists = file => {
                expect(file).to.include('filename')
                expect(expectedErrorMessage).to.deep.include(expectedError)
                done()
            }
            const next = message => (expectedErrorMessage = message)

            controller.handleClassifyDemo(populatedRequest, response, next)
        })
    })
})
