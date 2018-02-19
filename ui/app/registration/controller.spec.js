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
const mockValidationResult = {
    validationResult: () => validationObject
}
const mockValidate = {}
const mockReturnError = {
    backendError: () => 'backend error',
    unexpectedError: () => 'unexpected error'
}
const mockHttpRequest = {
    post: undefined
}
const controller = proxyquire('./controller', {
    'express-validator/check': mockValidationResult,
    '../security/form-validation': mockValidate,
    '../errors/index': mockReturnError,
    'request': mockHttpRequest
})

// scenarios ============================
describe('Registration Controller', () => {
    describe('postRegister', () => {
        it('renders if the validation result returns an error', (done) => {
            validationObject.isEmpty = () => false
            controller.postRegister[1](request, response)
            expect(result.message).to.deep.equal({page: 'Register', user: {user: 'user'}, errors: true})
            done()
        })
        it('"nexts" an error if posting to the API fails', (done) => {
            validationObject.isEmpty = () => true
            mockHttpRequest.post = (data, callback) => callback(new Error())
            const next = (message) => {
                expect(message).to.deep.equal('backend error')
                done()
            }
            controller.postRegister[1](request, response, next)
        })
        it('renders if posting to the API returns a renderable error', (done) => {
            const postRegisterResult = {error: 'users already exists'}
            const expectedMessage = {page: 'Register', user: 'user', errors: [ { msg: 'users already exists' } ]}
            validationObject.isEmpty = () => true
            mockHttpRequest.post = (data, callback) => callback(null, postRegisterResult)
            controller.postRegister[1](request, validatingResponse(expectedMessage))
            done()
        })
        it('redirects if posting to the API succeeds', (done) => {
            const postRegisterResult = {auth: true, token: 'token', user_id: 1}
            validationObject.isEmpty = () => true
            mockHttpRequest.post = (data, callback) => callback(null, postRegisterResult)
            controller.postRegister[1](request, validatingResponse('/'))
            done()
        })
    })
})
