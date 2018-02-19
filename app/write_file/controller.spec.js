'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
mute(process.stderr)

// mocked dependencies ==================
const mockBase64 = {
    jpeg: '/9j/4AAQSkZJRgABAQAAAQABAA',
    png: 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCA'
}
const mockFileName = 'uuid.jpeg'
const mockFs = {
    writeFile: undefined
}
const mockUuid = {
    v4: () => 'uuid'
}
const mockPngToJpeg = () => () => Promise.resolve()
const mockReturnError = {
    invalidBase64Argument: () => new Error('invalid argument error'),
    internalError: () => new Error('internal error'),
    invalidFileFormat: () => new Error('invalid file format')
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    'fs': mockFs,
    'uuid': mockUuid,
    'png-to-jpeg': mockPngToJpeg
})

// scenarios ============================
describe('Write File Controller', () => {
    describe('handleWriteFileRequest', () => {
        it('checks that the argument (base64) is present', (done) => {
            controller.handleWriteFile(undefined).then(() => {
                done(new Error('Writing file should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument error')
                done()
            })
        })
        it('checks that the argument (base64) is a string', (done) => {
            controller.handleWriteFile(2).then(() => {
                done(new Error('Writing file should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument error')
                done()
            })
        })
        it('checks that base64 string is for a valid file format', (done) => {
            controller.handleWriteFile('test').then(() => {
                done(new Error('Writing file should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid file format')
                done()
            })
        })
        it('checks that base64 string is for a valid JPEG', (done) => {
            mockFs.writeFile = (fileName, base64, option, callback) => callback(null, fileName)
            controller.handleWriteFile(mockBase64.jpeg).then((result) => {
                expect(result).to.have.string(mockFileName)
                done()
            }).catch((error) => done(error))
        })
        it('checks that base64 string is for a valid PNG', (done) => {
            mockFs.writeFile = (fileName, base64, option, callback) => callback(null, fileName)
            controller.handleWriteFile(mockBase64.png).then((result) => {
                expect(result).to.have.string(mockFileName)
                done()
            }).catch((error) => done(error))
        })
    })
})
