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
const parseTensorFlow = proxyquire('./parse-tensorflow', {
    '../return-error/return-error': mockReturnError
})

describe('parse-tensorflow', () => {
    describe('parseTensorFlowResult', () => {
        it('checks that argument (result) is present', () => {
            expect(function() { parseTensorFlow.parseTensorFlowResult(undefined) })
                .to.throw(Error).with.property('code', 400)
        })
        it('checks that argument (result) is a string', () => {
            expect(function() { parseTensorFlow.parseTensorFlowResult(2) }).to.throw(Error).with.property('code', 400)
        })
    })
})
