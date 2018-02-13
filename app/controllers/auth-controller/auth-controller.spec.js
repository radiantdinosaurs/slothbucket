'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
process.env.SECRET = 'secret'
mute(process.stderr)

const validationObject = {
    isEmpty: undefined,
    formatWith: (param, msg) => msg,
    array: () => true
}
const result = {
    status: undefined,
    message: undefined
}
const request = {
    body: {
        username: 'username',
        email: 'email',
        password: 'password'
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

// mocked dependencies
const mockValidationResult = {
    validationResult: () => validationObject
}
const mockJwt = {
    sign: undefined
}
const mockUserController = {
    createUser: undefined,
    findUser: undefined
}
const mockVerify = {
    verifyPassword: undefined
}
const authController = proxyquire('./auth-controller', {
    'express-validator/check': mockValidationResult,
    '../user-controller/user-controller': mockUserController,
    'jsonwebtoken': mockJwt,
    '../../utils/auth/verify': mockVerify
})

describe('auth-controller', () => {
    describe('postRegister', () => {
        it('sends a response if validation results in an error', (done) => {
            validationObject.isEmpty = () => false
            authController.post_register[1](request, response)
            expect(result.message).to.deep.equal({status: 200, error: true})
            done()
        })
        it('sends a response if creating the user is not successful', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.createUser = () => new Promise((resolve, reject) => reject(new Error('not created')))
            authController.post_register[1](request, validatingResponse({status: undefined, error: 'not created'}))
            done()
        })
        it('sends a response if user is successfully created', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.createUser = () => new Promise((resolve) => resolve({_id: 1}))
            mockJwt.sign = () => 'token'
            authController.post_register[1](request, validatingResponse({auth: true, token: 'token', user_id: 1}))
            done()
        })
    })
    describe('postLogin', () => {
        it('sends a response if validation results in an error', (done) => {
            validationObject.isEmpty = () => false
            authController.post_login[1](request, response)
            expect(result.message).to.deep.equal({status: 200, error: true})
            done()
        })
        it('sends a response if finding the user is not successful', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.findUser = () => new Promise((resolve, reject) => reject(new Error('not found')))
            authController.post_login[1](request, validatingResponse({status: undefined, error: 'not found'}))
            done()
        })
        it('sends a response if verifying the user is not successful', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.findUser = () => new Promise((resolve) => resolve({user: 'user'}))
            mockVerify.verifyPassword = () => new Promise((resolve, reject) => reject(new Error('not verified')))
            authController.post_login[1](request, validatingResponse({status: undefined, error: 'not verified'}))
            done()
        })
        it('sends a response if user is successfully authenticated', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.findUser = () => new Promise((resolve) => resolve({_id: 1}))
            mockVerify.verifyPassword = () => new Promise((resolve) => resolve())
            mockJwt.sign = () => 'token'
            authController.post_login[1](request, validatingResponse({auth: true, token: 'token', user_id: 1}))
            done()
        })
    })
})
