'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect

// mocked dependencies
const mockReturnError = {
    invalidBase64Argument: () => new Error('invalid argument error'),
    internalError: () => new Error('internal error')
}
const runTensorFlow = proxyquire('./run-tensorflow', {
    '../error/return-error': mockReturnError
})

describe('run-tensorflow', () => {
    describe('classifyImage', () => {
        it('checks that argument (fileName) is present', (done) => {
            runTensorFlow.classifyImage(undefined)
                .then(() => {
                    done(new Error('Running TensorFlow should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument error')
                    done()
                })
        })
        it('checks that argument (fileName) is a string', (done) => {
            runTensorFlow.classifyImage(2)
                .then(() => {
                    done(new Error('Running TensorFlow should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument error')
                    done()
                })
        })
        it('checks that argument (fileName) is appended with \'.jpeg\' or \'.png\'', (done) => {
            runTensorFlow.classifyImage('<test>')
                .then(() => {
                    done(new Error('Running TensorFlow should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument error')
                    done()
                })
        })
    })
})
