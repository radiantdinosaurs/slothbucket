'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
process.env.SECRET = 'secret'
mute(process.stderr)

// mocked dependencies ==================
let expectedMessage
const request = {
    headers: {
        'x-access-token': undefined
    },
    body: {
        username: 'username',
        email: 'email',
        password: 'password'
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
const validationObject = {
    isEmpty: undefined,
    formatWith: (param, msg) => msg,
    array: () => true
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
const next = (message) => {
    expect(message).to.deep.include(expectedMessage)
}
const mockJwt = {
    verify: undefined,
    sign: undefined
}
const mockValidationResult = {
    validationResult: () => validationObject
}
const mockReturnError = {
    failedTokenAuthentication: () => new Error('auth failed'),
    internalError: () => new Error('internal error'),
    incorrectUsernameOrPassword: () => new Error('incorrect username or password'),
    incompleteArguments: () => new Error('incomplete arguments')
}
const mockBcrypt = {
    compare: undefined
}
const mockUserController = {
    createUser: undefined,
    findUser: undefined
}
const mockVerify = {
    verifyPassword: undefined
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    'jwt': mockJwt,
    'bcrypt': mockBcrypt,
    'express-validator/check': mockValidationResult,
    '../users/index': mockUserController
})

// scenarios ============================
describe('Security Controller', () => {
    describe('handleAuthentication', () => {
        it('sends a response if validation results in an error', (done) => {
            validationObject.isEmpty = () => false
            controller.handleAuthentication[1](request, response, next)
            expect(result.message).to.deep.equal({status: 200, error: true})
            done()
        })
        it('sends a response if finding the users is not successful', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.findUserByUserName = () => new Promise((resolve, reject) => reject(new Error('not found')))
            controller.handleAuthentication[1](request, response, next)
            done()
        })
        it('sends a response if verifying the users is not successful', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.findUserByUserName = () => new Promise((resolve) => resolve({user: 'user'}))
            mockVerify.verifyPassword = () => new Promise((resolve, reject) => reject(new Error('not verified')))
            controller.handleAuthentication[1](request, validatingResponse({status: undefined, error: 'not verified'}))
            done()
        })
        it('sends a response if users is successfully authenticated', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.findUserByUserName = () => new Promise((resolve) => resolve({_id: 1}))
            mockVerify.verifyPassword = () => new Promise((resolve) => resolve())
            mockJwt.sign = () => 'token'
            controller.handleAuthentication[1](request, validatingResponse({auth: true, token: 'token', user_id: 1}))
            done()
        })
    })
})
