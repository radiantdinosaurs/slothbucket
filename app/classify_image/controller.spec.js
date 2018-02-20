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
        base64: undefined
    }
}
const response = {
    send: (message) => {
        result.message = message
    },
    status: function status() {
        return this
    }
}
const validatingResponse = (expectedResult) => {
    let responseObject = {
        send: (message) => {
            response.send(message)
            expect(result.message).to.deep.equal(expectedResult)
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
    invalidBase64Argument: () => new Error('invalid argument error'),
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
        it('sends a response if request argument (base64) is not specified', (done) => {
            const expectedMessage = {status: 400,
                error: 'Cannot read undefined body. Format as \'{\'base64\': \'(your base64 here)\'}\'.'}
            controller.handleClassifyImage(request, validatingResponse(expectedMessage))
            done()
        })
        it('sends a response if writing file is unsuccessful', (done) => {
            const expectedResult = {status: 500, error: 'Internal error encountered. Please try again.'}
            request.body.base64 = 'base64'
            mockWriteFile.handleWriteFile = () => new Promise((resolve, reject) => reject(new Error('fail')))
            controller.handleClassifyImage(request, validatingResponse(expectedResult))
            done()
        })
        it('sends a response if running tensorflow is unsuccessful', (done) => {
            const expectedResult = {status: 500, error: 'Internal error encountered. Please try again.'}
            request.body.base64 = 'base64'
            mockWriteFile.handleWriteFile = () => new Promise((resolve) => resolve('filename'))
            mockTensorflow.classifyImage = () => new Promise((resolve, reject) => {
                const error = new Error('fail')
                error.code = 500
                reject(error)
            })
            controller.handleClassifyImage(request, validatingResponse(expectedResult))
            done()
        })
    })
})
