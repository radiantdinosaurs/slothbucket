'use strict'

const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect

// mocked dependencies
const mockReturnError = {
    invalidArgumentError: function() { return new Error() }
}
const writeFile = proxyquire('./write-file', {
    '../return-error/return-error': mockReturnError
})

describe('write_file', () => {
    describe('handleWriteFileRequest', () => {
        it('checks that base64 is present', (done) => {
            writeFile.writeFileToDisk(undefined)
                .then(() => {
                    done(new Error('Writing file should not have been successful'))
                })
                .catch((error) => {
                    expect(error).to.be.an.instanceOf(Error)
                    done()
                })
        })
    })
})
