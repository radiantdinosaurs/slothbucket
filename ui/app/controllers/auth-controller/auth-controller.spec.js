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
    page: undefined,
    message: undefined
}
const request = {
    body: {
        user: 'user'
    },
    session: {
        userId: undefined,
        jwt: undefined
    }
}
const response = {
    render: (page, message) => {
        result.page = page
        result.message = message
    },
    redirect: (page) => {
        result.page = page
    },
    status: function(responseStatus) {
        return this
    }
}
const validatingResponse = (expectedMessage) => {
    let responseObject = {
        render: (page, message) => {
            response.render(page, message)
            expect(result.message).to.deep.equal(expectedMessage)
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
const mockValidate = {}
const mockReturnError = {
    backendError: () => 'backend error',
    unexpectedError: () => 'unexpected error'
}
const mockHttpRequestController = {
    postRegisterRequest: undefined,
    postLoginRequest: undefined
}
const authController = proxyquire('./auth-controller', {
    'express-validator/check': mockValidationResult,
    '../../middlewares/auth/validate': mockValidate,
    '../../utils/error/return-error': mockReturnError,
    '../http-request-controller/http-request-controller': mockHttpRequestController
})

describe('auth-controller', () => {
    describe('post_register', () => {
        it('renders if the validation result returns an error', (done) => {
            validationObject.isEmpty = () => false
            authController.post_register[1](request, response)
            expect(result.message).to.deep.equal({page: 'Register', user: undefined, errors: true})
            done()
        })
        it('"nexts" an error if posting to the API fails', (done) => {
            validationObject.isEmpty = () => true
            mockHttpRequestController.postRegisterRequest = () => new Promise((resolve, reject) => reject(new Error()))
            const next = (message) => {
                expect(message).to.deep.equal('backend error')
                done()
            }
            authController.post_register[1](request, response, next)
        })
        it('renders if posting to the API returns a renderable error', (done) => {
            const postRegisterResult = {error: 'user already exists'}
            const expectedMessage = {page: 'Register', user: 'user', errors: [ { msg: 'user already exists' } ]}
            validationObject.isEmpty = () => true
            mockHttpRequestController.postRegisterRequest = () => new Promise((resolve) => resolve(postRegisterResult))
            authController.post_register[1](request, validatingResponse(expectedMessage))
            done()
        })
        it('redirects if posting to the API succeeds', (done) => {
            const postRegisterResult = {auth: true, token: 'token', user_id: 1}
            validationObject.isEmpty = () => true
            mockHttpRequestController.postRegisterRequest = () => new Promise((resolve) => resolve(postRegisterResult))
            authController.post_register[1](request, validatingResponse('/'))
            done()
        })
        it('"nexts" an error if posting to the API returns an unexpected result', (done) => {
            validationObject.isEmpty = () => true
            mockHttpRequestController.postRegisterRequest = () => new Promise((resolve) => resolve({}))
            const next = (message) => {
                expect(message).to.deep.equal('unexpected error')
                done()
            }
            authController.post_register[1](request, response, next)
        })
    })
    describe('post_login', () => {
        it('renders if the validation result returns an error', (done) => {
            validationObject.isEmpty = () => false
            authController.post_login[1](request, response)
            expect(result.message).to.deep.equal({page: 'Login', errors: true})
            done()
        })
        it('"nexts" an error if posting to the API fails', (done) => {
            validationObject.isEmpty = () => true
            request.body = 'user'
            mockHttpRequestController.postLoginRequest = () => new Promise((resolve, reject) => reject(new Error()))
            const next = (message) => {
                expect(message).to.deep.equal('backend error')
                done()
            }
            authController.post_login[1](request, response, next)
        })
        it('renders if posting to the API returns a renderable error', (done) => {
            const expectedMessage = {page: 'Login', errors: [{msg: 'incorrect creds'}]}
            validationObject.isEmpty = () => true
            request.body = 'user'
            mockHttpRequestController.postLoginRequest = () => new Promise((resolve) => resolve(new Error('incorrect creds')))
            authController.post_login[1](request, validatingResponse(expectedMessage))
        })
        it('redirects if posting to the API succeeds', (done) => {
            const mockPostLoginResult = {auth: true, token: 'token', user_id: 1}
            validationObject.isEmpty = () => true
            request.body = 'user'
            mockHttpRequestController.postLoginRequest = () => new Promise((resolve) => resolve(mockPostLoginResult))
            authController.post_login[1](request, validatingResponse('/'))
        })
        it('"nexts" an error if posting to the API returns an unexpected result', (done) => {
            validationObject.isEmpty = () => true
            request.body = 'user'
            mockHttpRequestController.postLoginRequest = () => new Promise((resolve) => resolve({}))
            const next = (message) => {
                expect(message).to.deep.equal('unexpected error')
                done()
            }
            authController.post_login[1](request, response, next)
        })
    })
})
