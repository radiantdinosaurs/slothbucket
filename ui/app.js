'use strict'

const express = require('express')
const app = express()
const path = require('path')
// const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
// const winston = require('winston')
// const logger = new (winston.Logger)({
//     transports: [
//         new (winston.transports.Console)({
//             level: 'info',
//             colorize: true,
//             timestamp: true,
//             silent: false
//         }, {
//             level: 'warn',
//             colorize: true,
//             timestamp: true,
//             silent: false
//         }, {
//             level: 'error',
//             colorize: true,
//             timestamp: true,
//             silent: false
//         })
//     ]
// })

// routes ===============================
const index = require('./routes/index')
app.use('/', index)

// config ===============================
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// catch 404 and forward to error handler
app.use(function(request, response, next) {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

// error handler
app.use(function(error, request, response) {
    response.locals.message = error.message
    response.locals.error = request.app.get('env') === 'development' ? error : {}
    // render the error page
    response.status(error.status || 500)
    response.render('error')
})

module.exports = app
