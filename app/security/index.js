'use strict'

const controller = require('./controller')

module.exports = {
    handleAuthentication: controller.handleAuthentication,
    requiresToken: controller.requiresToken
}
