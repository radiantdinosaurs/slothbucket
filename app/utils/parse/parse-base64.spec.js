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
const parseBase64 = proxyquire('./parse-base64', {
    '../return-error/return-error': mockReturnError
})

describe('parse-base64', () => {
    describe('stripDataLabel', () => {
        it('checks that argument (result) is present', () => {
            expect(function() { parseBase64.stripDataLabel(undefined) }).to.throw(Error).with.property('code', 400)
        })
        it('checks that argument (result) is a string', () => {
            expect(function() { parseBase64.stripDataLabel(34) }).to.throw(Error).with.property('code', 400)
        })
        it('checks that argument (result) includes \'.jpeg\' or \'.png\'', () => {
            expect(function() { parseBase64.stripDataLabel('test') }).to.throw(Error).with.property('code', 400)
        })
    })
})
