'use strict'

// test modules =========================
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const mute = require('mute')
mute(process.stderr)

// mocked dependencies ==================
const mockFs = {
    existsSync: undefined,
    unlink: undefined
}
const controller = proxyquire('./controller', {
    'fs': mockFs
})

// scenarios ============================
describe('Delete File Controller', () => {
    describe('deleteFileIfExists', () => {
    })
})
