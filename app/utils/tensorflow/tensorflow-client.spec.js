'use strict'

// dependencies
const dirtyChai = require('dirty-chai')
const chai = require('chai')
chai.use(dirtyChai)
const proxyquire = require('proxyquire')
const expect = chai.expect

// mocks
const mockChildProcess = {
    execFile: undefined,
    exec: undefined
}

// scenarios
describe('tensorflow-client', () => {
    describe('classifyImage - production', () => {
        let tensorflow
        before(() => {
            process.env.SLOTHBUCKET_ENV = 'production'
            tensorflow = proxyquire('./tensorflow-client.js', {
                'child_process': mockChildProcess
            })
        })

        after(() => {
            delete process.env.SLOTHBUCKET_ENV
        })

        it('returns a Promise', () => {
            mockChildProcess.execFile = () => {}
            const result = tensorflow.classifyImage('/file.jpg')
            expect(result).to.be.instanceof(Promise)
        })

        it('rejects if child_process has an error', (done) => {
            mockChildProcess.execFile = (program, args, config, callback) => {
                callback(new Error(), undefined)
            }

            tensorflow.classifyImage('/error-file.jpg').then((result) => {
                done(Error('This function should not have resolved!'))
            }).catch((err) => {
                expect(err).to.exist()
                expect(err).to.be.instanceof(Error)
                done()
            })
        })

        it('can resolve tensorflow output', (done) => {
            const result = 'something something'
            mockChildProcess.execFile = (program, args, config, callback) => {
                callback(null, result)
            }

            tensorflow.classifyImage('/file.jpg').then((output) => {
                expect(output).to.equal(result)
                done()
            }).catch((err) => {
                done(Error(err))
            })
        })
    })

    describe('classifyImage - development', () => {
        const dockerContainer = 'fake_docker_container'
        let tensorflow
        before(() => {
            process.env.SLOTHBUCKET_ENV = 'dev'
            process.env.SLOTHBUCKET_TENSORFLOW_DOCKER_NAME = dockerContainer
            tensorflow = proxyquire('./tensorflow-client.js', {
                'child_process': mockChildProcess
            })
        })

        after(() => {
            delete process.env.SLOTHBUCKET_ENV
            delete process.env.SLOTHBUCKET_TENSORFLOW_DOCKER_NAME
        })

        it('copies file over, runs tensorflow, then deletes the file', (done) => {
            const result = 'Success!'
            mockChildProcess.exec = (command, config, callback) => {
                if (command.indexOf('cp') >= 0) {
                    callback(null, 'remote-file-name.jpg')
                } else if (command.indexOf('exec') >= 0) {
                    callback(null, result)
                } else {
                    callback(new Error())
                }
            }
            tensorflow.classifyImage('fake-file.jpg').then((output) => {
                expect(output).to.equal(result)
                done()
            }).catch((err) => {
                done(Error(err))
            })
        })
    })
})
