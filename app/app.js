'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const parseTensorFlow = require('./utils/parse/parse-tensorflow')
const writeFile = require('./utils/write_file/write-file')
const runTensorFlow = require('./utils/tensorflow/run-tensorflow')
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

// config ===============================
app.set('port', (process.env.PORT || 8000))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}))
app.use((error, request, response, next) => {
    if (error instanceof SyntaxError) {
        logger.log('error', error)
        return response.status(400).send({status: 400,
            message: 'Cannot read body. Format as \'{\'base64\': \'(your base64 string here)\'}\'.'})
    }
})

// routes ===============================
app.post('/sloth-check', (request, response) => {
    const base64 = request.body.base64
    if (base64) {
        // first, write the file to disk
        writeFile.writeFileToDisk(base64).then((fileName) => {
            // next, run TensorFlow's trained model
            runTensorFlow.classifyImage(fileName).then((tensorFlowResult) => {
                // finally, send the result
                response.status(200).send(parseTensorFlow.parseTensorFlowResult(tensorFlowResult))
            }).catch(error => {
                if (error.code === 500) logger.log('error', error)
                else logger.log('warn', error)
                response.status(error.code)
                    .send({status: error.code, message: 'Internal error encountered. Please try again.'})
            })
        }).catch(error => {
            if (error.code === undefined) error.code = 500
            if (error.code === 500) logger.log('error', error)
            else logger.log('warn', error)
            response.status(error.code).send({status: error.code, message: error.message})
        })
    } else {
        response.status(400).send({status: 400,
            message: 'Cannot read undefined body. Format as \'{\'base64\': \'(your base64 here)\'}\'.'})
    }
})

// launch ===============================
app.listen(app.get('port'), (error) => {
    if (error) logger.log('error', error)
    logger.log('info', 'App is running, server is listening on port' + app.get('port'))
})
