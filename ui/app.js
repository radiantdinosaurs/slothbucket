'use strict'

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const helmet = require('helmet')
const logger = require('./utils/logging/logger')
const app = express()
// const favicon = require('serve-favicon')

// database connection ==================
const dbUrl = ''
mongoose.connect(dbUrl, (error) => {
    if (error) {
        logger.log('error', error)
        throw new Error('Problem connecting to the database')
    }
    logger.log('info', 'Connected to the database')
})

// config ===============================
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(helmet())
app.use(session({
    secret: '',
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000 // expires in one hour
    },
    store: new MongoStore({
        url: dbUrl
    })
}))
app.use(function(request, response, next) {
    response.locals.currentUser = request.session.userId
    next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// routes ===============================
const router = require('./routes/router')
app.use('/', router)

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
