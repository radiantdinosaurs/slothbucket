'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
mute(process.stderr)

const userData = {
    username: undefined,
    display_name: undefined,
    email: undefined,
    password: undefined
}

// mocked dependencies
const mockUser = ({
    username: undefined,
    display_name: undefined,
    email: undefined,
    password: undefined,
    created: undefined,
    create: undefined,
    findOne: undefined
})
const mockReturnError = {
    internalError: () => new Error('internal error'),
    incorrectUsernameOrPassword: () => new Error('incorrect username or password'),
    duplicateUserFound: () => new Error('duplicate user found')
}
const userController = proxyquire('./user-controller', {
    '../../utils/error/return-error': mockReturnError,
    '../../models/user': mockUser
})

describe('user-controller', () => {
    describe('createUser', () => {
        it('rejects with an error if Mongoose finds a duplicate user', (done) => {
            mockUser.create = (data, callback) => {
                const error = new Error()
                error.code = 11000
                callback(error)
            }
            userController.createUser(userData).then(() => {
                done(new Error('Creating user should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'duplicate user found')
                done()
            })
        })
        it('rejects with error if Mongoose returns an error', (done) => {
            mockUser.create = (data, callback) => callback(new Error())
            userController.createUser(userData).then(() => {
                done(new Error('Creating user should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'internal error')
                done()
            })
        })
        it('resolves if Mongoose successfully creates the user in the database', (done) => {
            mockUser.create = (data, callback) => callback(null, 'user')
            userController.createUser(userData).then((output) => {
                expect(output).to.equal('user')
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe('findUser', () => {
        it('rejects with error if Mongoose returns an error', (done) => {
            mockUser.findOne = (username, password, callback) => callback(new Error())
            userController.findUser(userData.username).then(() => {
                done(new Error('Finding user should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'internal error')
                done()
            })
        })
        it('rejects with error if Mongoose does not return an error or a query result', (done) => {
            mockUser.findOne = (username, password, callback) => callback(null, null)
            userController.findUser(userData.username).then(() => {
                done(new Error('Finding user should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'incorrect username or password')
                done()
            })
        })
        it('resolves if Mongoose returns a result from its query', (done) => {
            mockUser.findOne = (username, password, callback) => callback(null, 'user')
            userController.findUser(userData.username).then((output) => {
                expect(output).to.deep.equal('user')
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
