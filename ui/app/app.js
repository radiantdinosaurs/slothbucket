'use strict'

const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const helmet = require('helmet')
const logger = require('./logging/index')
const returnError = require('./errors/index')
const app = express()
// const favicon = require('serve-favicon')

// database connection ==================
const dbUrl = process.env.DB_URL
mongoose.connect(dbUrl).then(() => {
    logger.log('info', 'Connected to the database')
}).catch((error) => logger.log('error', error))

// config ===============================
app.set('port', (process.env.PORT || 8080))
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')
app.use(helmet())
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000 // expires in one hour
    },
    store: new MongoStore({
        url: dbUrl
    })
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../public')))
// app.use(favicon(path.join(__dirname, '../public', 'favicon.ico')))

// routes ===============================
app.use(function(request, response, next) {
    response.locals.currentUser = request.session.userId
    next()
})
const router = require('./router')
app.use('/', router)

// handler for 404 (page not found)
app.use((request, response, next) => next(returnError.resourceNotFound()))

// handler for sending errors
app.use((error, request, response, next) => {
    if (error) {
        if (error.code) {
            response.status(error.code).render('error', {message: error.message})
        } else {
            logger.log('error', error)
            error = returnError.unexpectedError()
            response.status(error.code).render('error', {message: error.message})
        }
    }
})

// launch ===============================
app.listen(app.get('port'), (error) => {
    if (error) logger.log('error', error)
    else logger.log('info', 'App is running, server is listening on port ' + app.get('port'))
})
