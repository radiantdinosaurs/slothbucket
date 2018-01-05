'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const parseTensorFlow = require('./utils/tensorflow/parse-tensorflow')
const writeFile = require('./utils/write-file')
const runTensorFlow = require('./utils/tensorflow/run-tensorflow')

// config ===============================
app.set('port', (process.env.PORT || 8000))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}))

// routes ===============================
app.post('/sloth-check', (request, response) => {
    const base64 = request.body.base64
    if (base64) {
        // first, write the file to disk
        writeFile.writeFileToDisk(base64).then((fileName) => {
            // next, run TensorFlow's trained model
            runTensorFlow.classifyImage(fileName).then((tensorFlowResult) => {
                // finally, send the result
                if (tensorFlowResult instanceof Error) {
                    response.status(tensorFlowResult.statusCode)
                        .send({status: tensorFlowResult.statusCode, message: tensorFlowResult.message})
                } else {
                    response.status(200).send(parseTensorFlow.parseTensorFlowResult(tensorFlowResult))
                }
            }).catch(error => {
                console.log(error)
                response.status(500).send({status: 500,
                    message: 'Internal error encountered while running TensorFlow script.'})
            })
        }).catch(error => {
            console.log(error)
            response.status(500).send({status: 500, message: 'Internal error while trying to save file to disk'})
        })
    } else {
        response.status(400).send({status: 400,
            message: 'Cannot read undefined body. Format as \'{\'base64\': \'(your base64 here)\'}\'.'})
    }
})

// launch ===============================
app.listen(app.get('port'), (error) => {
    if (error) {
        console.log(error)
    }
    console.log('App is running, server is listening on port', app.get('port'))
})
