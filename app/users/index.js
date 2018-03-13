'use strict'

const controller = require('./controller')

module.exports = {
    createUser: controller.createUser,
    findUserByUserName: controller.findUserByUserName
}
