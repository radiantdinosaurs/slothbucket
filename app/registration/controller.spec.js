'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
process.env.SECRET = 'secret'
mute(process.stderr)

// mocked dependencies ==================
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
const controller = proxyquire('./controller', {
    'express-validator/check': mockValidationResult,
    '../user-controller/user-controller': mockUserController,
    'jsonwebtoken': mockJwt,
    '../../utils/auth/verify': mockVerify
})

// scenarios ============================
describe('Registration Controller', () => {
    describe('handleRegistration', () => {
        it('sends a response if validation results in an error', (done) => {
            validationObject.isEmpty = () => false
            controller.handleRegistration[1](request, response)
            expect(result.message).to.deep.equal({status: 200, error: true})
            done()
        })
        it('sends a response if creating the users is not successful', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.createUser = () => new Promise((resolve, reject) => reject(new Error('not created')))
            controller.handleRegistration[1](request, validatingResponse({status: undefined, error: 'not created'}))
            done()
        })
        it('sends a response if users is successfully created', (done) => {
            validationObject.isEmpty = () => true
            mockUserController.createUser = () => new Promise((resolve) => resolve({_id: 1}))
            mockJwt.sign = () => 'token'
            controller.handleRegistration[1](request, validatingResponse({auth: true, token: 'token', user_id: 1}))
            done()
        })
    })
})
