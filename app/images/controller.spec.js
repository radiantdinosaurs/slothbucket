'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
// const mute = require('mute')
// mute(process.stderr)

// mocked dependencies ==================
const mockImageData = {
    file_path: undefined,
    user_id: undefined
}
const mockImage = ({
    create: undefined,
    find: undefined,
    exec: undefined
})
const mockReturnError = {
    internalError: () => new Error('internal error')
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    './image': mockImage
})

// scenarios ============================
describe('Image Controller', () => {
    describe('saveImage', () => {
        it('rejects with an error if Mongoose encounters an error', (done) => {
            mockImage.create = (data, callback) => {
                const error = new Error()
                callback(error)
            }
            controller.saveImage(mockImageData).then(() => {
                done(new Error('Saving image should not have been successful'))
            }).catch((error) => {
                expect(error).to.be.an.instanceOf(Error).which.has.property('message', 'internal error')
                done()
            })
        })
        it('resolves if Mongoose successfully creates the image in the database', (done) => {
            mockImage.create = (data, callback) => callback(null, 'image')
            controller.saveImage(mockImageData).then((output) => {
                expect(output).to.equal('image')
                done()
            }).catch((error) => done(error))
        })
    })
})
