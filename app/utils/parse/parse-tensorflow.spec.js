'use strict'

const dirtyChai = require('dirty-chai')
const chai = require('chai')
chai.use(dirtyChai)
const proxyquire = require('proxyquire')
const expect = chai.expect

// mocked dependencies
const mockReturnError = {
    invalidArgumentError: function() { return new Error('invalid argument error') },
    internalError: function() { return new Error('internal error') }
}
const parseTensorFlow = proxyquire('./parse-tensorflow', {
    '../error/return-error': mockReturnError
})

describe('parse-tensorflow', () => {
    describe('parseTensorFlowResult', () => {
        it('checks that argument (result) is present', () => {
            expect(() => { parseTensorFlow.parseTensorFlowResult(undefined) })
                .to.throw(Error).with.property('message', 'invalid argument error')
        })
        it('checks that param is a string', () => {
            expect(() => { parseTensorFlow.parseTensorFlowResult(2) })
                .to.throw(Error).with.property('message', 'invalid argument error')
        })
        it('can tolerate malformed strings', () => {
            const result = parseTensorFlow.parseTensorFlowResult('malformed-strings,whoa')
            expect(result).to.exist()
            expect(result['sloth_check'].contains_sloth).to.equal(false)
            expect(result['image_labels'].length).to.equal(0)
        })
    })
})
