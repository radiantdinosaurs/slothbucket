'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect

// mocked dependencies
const mockJwt = {
    verify: undefined
}
const mockReturnError = {
    failedAuthentication: () => new Error('auth failed'),
    internalError: () => new Error('internal error'),
    incorrectUsernameOrPassword: () => new Error('incorrect username or password'),
    generalInvalidArgument: () => new Error('invalid argument')
}
const mockBcrypt = {
    compare: undefined
}
const verify = proxyquire('./verify', {
    '../error/return-error': mockReturnError,
    'jwt': mockJwt,
    'bcrypt': mockBcrypt
})

describe('verify', () => {
    describe('verifyPassword', () => {
        it('checks that \'user.password\' and \'password\' is present', (done) => {
            const user = {password: ''}
            const password = ''
            verify.verifyPassword(user, password).then(() => {
                done(new Error('Verifying password should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument')
                done()
            })
        })
        it('rejects if \'bcrypt\' has an error', (done) => {
            const user = {password: 'password'}
            const password = 'password'
            mockBcrypt.compare = function compare(data, hash, callback) { callback(new Error()) }
            verify.verifyPassword(user, password).then(() => {
                done(new Error('Verifying password should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'internal error')
                done()
            })
        })
        it('rejects if \'bcrypt\' returns a \'false\' result', (done) => {
            const user = {password: 'password'}
            const password = 'password'
            mockBcrypt.compare = function compare(data, hash, callback) { callback(null, false) }
            verify.verifyPassword(user, password).then(() => {
                done(new Error('Verifying password should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'incorrect username or password')
                done()
            })
        })
        it('resolves if \'bcrypt\' returns a \'true\' result', (done) => {
            const user = {password: 'password'}
            const password = 'password'
            const result = true
            mockBcrypt.compare = function compare(data, hash, callback) { callback(null, true) }
            verify.verifyPassword(user, password).then((output) => {
                expect(output).to.equal(result)
                done()
            }).catch((error) => {
                done(new Error(error))
            })
        })
    })
})
