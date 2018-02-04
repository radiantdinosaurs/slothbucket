'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const logger = require('./utils/log/logger')
const returnError = require('./utils/error/return-error')
const app = express()

// database connection ==================
mongoose.connect(process.env.DB_URL, (error) => {
    if (error) logger.log('error', error)
    else logger.log('info', 'Connected to the database')
})

// config ===============================
app.set('port', (process.env.PORT || 8000))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}))

// routes ===============================
const router = require('./routes/router')
app.use('/', router)
app.use((request, response, next) => next(returnError.resourceNotFound()))
app.use((error, request, response, next) => {
    if (error) {
        if (error.code) {
            response.status(error.code).send({status: error.code, message: error.message})
        } else {
            logger.log('error', error)
            error = returnError.unexpectedError()
            response.status(error.code).send({status: error.code, message: error.message})
        }
    }
})

// launch ===============================
app.listen(app.get('port'), (error) => {
    if (error) logger.log('error', error)
    else logger.log('info', 'App is running, server is listening on port ' + app.get('port'))
})
