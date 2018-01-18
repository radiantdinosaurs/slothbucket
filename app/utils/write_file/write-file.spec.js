'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect

// mocked dependencies
const base64 = {
    jpeg: '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',
    png: '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'
}
const mockReturnError = {
    invalidArgumentError: function() {
        return new Error('invalid argument error')
    },
    internalError: function() {
        return new Error('internal error')
    },
    invalidFileFormat: function() {
        return new Error('invalid file format')
    }
}
const mockFs = {
    writeFile: undefined
}
const mockUuid = {
    v4: () => { return 'uuid' }
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
            mockFs.writeFile = () => Promise.resolve()
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
            mockFs.writeFile = () => Promise.resolve()
            writeFile.writeFileToDisk(base64.jpeg)
                .then((result) => {
                    expect(result).to.have.string('uuid.jpeg')
                    done()
                })
                .catch((error) => {
                    done(error)
                })
        })
        it('checks that base64 is a valid PNG', (done) => {
            mockFs.writeFile = () => Promise.resolve()
            writeFile.writeFileToDisk(base64.png)
                .then((result) => {
                    expect(result).to.have.string('uuid.jpeg')
                    done()
                })
                .catch((error) => {
                    done(error)
                })
        })
    })
})
