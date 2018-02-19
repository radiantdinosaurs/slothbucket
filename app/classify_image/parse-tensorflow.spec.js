'use strict'

// test modules =========================
const dirtyChai = require('dirty-chai')
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
mute(process.stderr)
chai.use(dirtyChai)

// mocked dependencies ==================
const mockReturnError = {
    invalidBase64Argument: function() { return new Error('invalid argument error') },
    internalError: function() { return new Error('internal error') }
}
const parseTensorFlow = proxyquire('./parse-tensorflow', {
    '../errors/index': mockReturnError
})

// scenarios ============================
describe('Parse Tensorflow', () => {
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
