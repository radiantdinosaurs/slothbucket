'use strict'

const controller = require('./controller')

module.exports = {
    postLogin: controller.postLogin,
    getLogin: controller.getLogin,
    logout: controller.logout,
    requiresLogin: controller.requiresLogin,
    requiresLogout: controller.requiresLogout
}
