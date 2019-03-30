'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
mute(process.stderr)

// mocked dependencies ==================
const mockUserData = {
    username: undefined,
    display_name: undefined,
    email: undefined,
    password: undefined
}
const mockUser = {
    username: undefined,
    display_name: undefined,
    email: undefined,
    password: undefined,
    created: undefined,
    create: undefined,
    findOne: undefined
}
const mockReturnError = {
    internalError: () => new Error('internal error'),
    incorrectUsernameOrPassword: () =>
        new Error('incorrect username or password'),
    duplicateUserFound: () => new Error('duplicate users found')
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    './user': mockUser
})

// scenarios ============================
describe('User Controller', () => {
    describe('createUser', () => {
        it('rejects with an error if Mongoose finds a duplicate users', done => {
            mockUser.create = (data, callback) => {
                const error = new Error()
                error.code = 11000
                callback(error)
            }
            controller
                .createUser(mockUserData)
                .then(() => {
                    done(
                        new Error(
                            'Creating users should not have been successful'
                        )
                    )
                })
                .catch(error => {
                    expect(error)
                        .to.be.an.instanceOf(Error)
                        .which.has.property('message', 'duplicate users found')
                    done()
                })
        })
        it('rejects with error if Mongoose returns an error', done => {
            mockUser.create = (data, callback) => callback(new Error())
            controller
                .createUser(mockUserData)
                .then(() => {
                    done(
                        new Error(
                            'Creating users should not have been successful'
                        )
                    )
                })
                .catch(error => {
                    expect(error)
                        .to.be.an.instanceOf(Error)
                        .which.has.property('message', 'internal error')
                    done()
                })
        })
        it('resolves if Mongoose successfully creates the users in the database', done => {
            mockUser.create = (data, callback) => callback(null, 'user')
            controller
                .createUser(mockUserData)
                .then(output => {
                    expect(output).to.equal('user')
                    done()
                })
                .catch(error => done(error))
        })
    })
    describe('findUserByUserName', () => {
        it('rejects with error if Mongoose returns an error', done => {
            mockUser.findOne = (username, password, callback) =>
                callback(new Error())
            controller
                .findUserByUserName(mockUserData.username)
                .then(() => {
                    done(
                        new Error(
                            'Finding users should not have been successful'
                        )
                    )
                })
                .catch(error => {
                    expect(error)
                        .to.be.an.instanceOf(Error)
                        .which.has.property('message', 'internal error')
                    done()
                })
        })
        it('rejects with error if Mongoose does not return an error or a query result', done => {
            mockUser.findOne = (username, password, callback) =>
                callback(null, null)
            controller
                .findUserByUserName(mockUserData.username)
                .then(() => {
                    done(
                        new Error(
                            'Finding users should not have been successful'
                        )
                    )
                })
                .catch(error => {
                    expect(error)
                        .to.be.an.instanceOf(Error)
                        .which.has.property(
                            'message',
                            'incorrect username or password'
                        )
                    done()
                })
        })
        it('resolves if Mongoose returns a result from its query', done => {
            mockUser.findOne = (username, password, callback) =>
                callback(null, 'user')
            controller
                .findUserByUserName(mockUserData.username)
                .then(output => {
                    expect(output).to.deep.equal('user')
                    done()
                })
                .catch(error => done(error))
        })
    })
})
