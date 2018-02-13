'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const base64 = {
    jpeg: '/9j/4AAQSkZJRgABAQAAAQABAA',
    png: 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCA'
}
const fileName = 'uuid.jpeg'

// mocked dependencies
const mockReturnError = {
    invalidBase64Argument: () => new Error('invalid argument error'),
    internalError: () => new Error('internal error'),
    invalidFileFormat: () => new Error('invalid file format')
}
const mockFs = {
    writeFile: undefined
}
const mockUuid = {
    v4: () => 'uuid'
}
const mockPngToJpeg = () => {
    return () => Promise.resolve()
}
const writeFile = proxyquire('./write-file', {
    '../error/return-error': mockReturnError,
    'fs': mockFs,
    'uuid': mockUuid,
    'png-to-jpeg': mockPngToJpeg
})

describe('write_file', () => {
    describe('handleWriteFileRequest', () => {
        it('checks that base64 is present', (done) => {
            writeFile.writeFileToDisk(undefined)
                .then(() => {
                    done(new Error('Writing file should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument error')
                    done()
                })
        })
        it('checks that base64 is a string', (done) => {
            writeFile.writeFileToDisk(2)
                .then(() => {
                    done(new Error('Writing file should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid argument error')
                    done()
                })
        })
        it('checks that base64 is valid file format', (done) => {
            writeFile.writeFileToDisk('test')
                .then(() => {
                    done(new Error('Writing file should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'invalid file format')
                    done()
                })
        })
        it('checks that base64 is a valid JPEG', (done) => {
            mockFs.writeFile = (fileName, base64, option, callback) => {
                callback(null, fileName)
            }
            writeFile.writeFileToDisk(base64.jpeg)
                .then((result) => {
                    expect(result).to.have.string(fileName)
                    done()
                })
                .catch((error) => {
                    done(error)
                })
        })
        it('checks that base64 is a valid PNG', (done) => {
            mockFs.writeFile = (fileName, base64, option, callback) => {
                callback(null, fileName)
            }
            writeFile.writeFileToDisk(base64.png)
                .then((result) => {
                    expect(result).to.have.string(fileName)
                    done()
                })
                .catch((error) => {
                    done(error)
                })
        })
    })
})
