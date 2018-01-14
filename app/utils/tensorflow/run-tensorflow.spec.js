'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect

// mocked dependencies
const mockReturnError = {
    invalidArgumentError: function() {
        let error = new Error()
        error.code = 400
        return error
    },
    internalError: function() {
        let error = new Error()
        error.code = 500
        return error
    }
}
const runTensorFlow = proxyquire('./run-tensorflow', {
    '../return-error/return-error': mockReturnError
})

describe('run-tensorflow', () => {
    describe('classifyImage', () => {
        it('checks that argument (fileName) is present', (done) => {
            runTensorFlow.classifyImage(undefined)
                .then(() => {
                    done(new Error('Running TensorFlow should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('code', 400)
                    done()
                })
        })
        it('checks that argument (fileName) is a string', (done) => {
            runTensorFlow.classifyImage(2)
                .then(() => {
                    done(new Error('Running TensorFlow should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('code', 400)
                    done()
                })
        })
        it('checks that argument (fileName) is appended with \'.jpeg\' or \'.png\'', (done) => {
            runTensorFlow.classifyImage('<test>')
                .then(() => {
                    done(new Error('Running TensorFlow should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('code', 400)
                    done()
                })
        })
    })
})
