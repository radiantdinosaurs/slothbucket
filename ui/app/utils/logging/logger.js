'use strict'

const winston = require('winston')
const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            level: 'info',
            colorize: true,
            timestamp: true,
            silent: false
        }, {
            level: 'warn',
            colorize: true,
            timestamp: true,
            silent: false
        }, {
            level: 'error',
            colorize: true,
            timestamp: true,
            silent: false
        })
    ]
})

module.exports = logger
