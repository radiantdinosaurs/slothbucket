'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
mute(process.stderr)

// mocked dependencies ==================
let expectedMessage
const result = {
    status: undefined,
    message: undefined
}
const request = {
    params: {
        id: undefined
    }
}
const response = {
    send: message => {
        result.message = message
    },
    status: function status() {
        return this
    },
    locals: {
        tensorFlowResult: undefined,
        fileName: undefined,
        userId: undefined
    }
}
const validatingResponse = expectedResult => {
    let responseObject = {
        send: message => {
            response.send(message)
            expect(result.message).to.deep.equal(expectedResult)
        }
    }
    let that = responseObject
    responseObject.status = status => {
        response.status(status)
        return that
    }
    return responseObject
}
const next = message => {
    expect(message).to.deep.include(expectedMessage)
}
const mockFs = {
    readFile: undefined
}
const mockImageController = {
    findImages: undefined
}
const mockReturnError = {
    incompleteRequest: () => new Error('incomplete request'),
    internalError: () => new Error('internal error'),
    incompleteArguments: () => new Error('incomplete arguments')
}
const controller = proxyquire('./controller', {
    '../errors/index': mockReturnError,
    fs: mockFs,
    '../images/index': mockImageController
})

// scenarios ============================
describe('Image Library Controller', () => {
    describe('handleImageLibraryRoute', () => {
        it('sends a response if request body\'s param is not specified', done => {
            expectedMessage = new Error('incomplete request')
            controller.handleImageLibraryRoute(request, response, next)
            done()
        })
        it('sends a response if finding images fails', done => {
            request.params.id = 'id'
            mockImageController.findImages = () =>
                new Promise((resolve, reject) => reject(new Error('fail')))
            expectedMessage = new Error('internal error')
            controller.handleImageLibraryRoute(request, response, next)
            done()
        })
        it('calls next to send an error if reading the file from the image list fails', done => {
            mockImageController.findImages = () => {
                return new Promise(resolve => {
                    const imageList = [
                        {
                            file_path:
                                'saved_images/c73a7b22-cbd1-46ed-8a42-265659b7522f.jpeg'
                        },
                        {
                            file_path:
                                'saved_images/c73a7b22-cbd1-46ed-8a42-265659b7522f.jpeg'
                        }
                    ]
                    resolve(imageList)
                })
            }
            mockFs.readFile = (filePath, callback) => {
                callback(new Error('fail'))
            }
            expectedMessage = new Error('internal error')
            controller.handleImageLibraryRoute(request, response, next)
            done()
        })
        it('sends a response with a base64 string for the images if reading the file is successful', done => {
            mockImageController.findImages = () => {
                return new Promise(resolve => {
                    const imageList = [
                        {
                            file_path:
                                'saved_images/c73a7b22-cbd1-46ed-8a42-265659b7522f.jpeg'
                        },
                        {
                            file_path:
                                'saved_images/c73a7b22-cbd1-46ed-8a42-265659b7522f.jpeg'
                        }
                    ]
                    resolve(imageList)
                })
            }
            mockFs.readFile = (filePath, callback) => {
                const data = '<Buffer 89 65 78>'
                callback(null, data)
            }
            const expectedResult = [
                { base64Image: 'PEJ1ZmZlciA4OSA2NSA3OD4=' },
                { base64Image: 'PEJ1ZmZlciA4OSA2NSA3OD4=' }
            ]
            controller.handleImageLibraryRoute(
                request,
                validatingResponse(expectedResult),
                next
            )
            done()
        })
    })
})
