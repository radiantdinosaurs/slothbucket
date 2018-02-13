'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
process.env.SECRET = 'secret'
mute(process.stderr)

const user = {
    password: 'password'
}
const password = 'password'
const request = {
    headers: {
        'x-access-token': undefined
    }
}
const result = {
    status: undefined,
    message: undefined
}
const response = {
    send: (message) => {
        result.message = message
    },
    status: function status() {
        return this
    }
}
const next = (callback) => callback()

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
        it('checks that parameters are present', (done) => {
            verify.verifyPassword(undefined, undefined).then(() => {
                done(new Error('Verifying password should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument')
                done()
            })
        })
        it('rejects if there\'s an error in comparing the passwords', (done) => {
            mockBcrypt.compare = function compare(data, hash, callback) { callback(new Error()) }
            verify.verifyPassword(user, password).then(() => {
                done(new Error('Verifying password should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'internal error')
                done()
            })
        })
        it('rejects if the passwords do not match', (done) => {
            mockBcrypt.compare = function compare(data, hash, callback) { callback(null, false) }
            verify.verifyPassword(user, password).then(() => {
                done(new Error('Verifying password should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'incorrect username or password')
                done()
            })
        })
        it('resolves if passwords match', (done) => {
            mockBcrypt.compare = function compare(data, hash, callback) { callback(null, true) }
            verify.verifyPassword(user, password).then((output) => {
                expect(output).to.equal(true)
                done()
            }).catch((error) => {
                done(new Error(error))
            })
        })
    })
    describe('requiresToken', () => {
        it('checks that the correct headers are set', (done) => {
            verify.requiresToken(request, response, next)
            expect(result.message).to.deep.equal({status: undefined, message: 'auth failed'})
            done()
        })
    })
})
