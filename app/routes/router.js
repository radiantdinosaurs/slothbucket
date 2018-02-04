'use strict'

const express = require('express')
const router = express.Router()
const logger = require('../utils/log/logger')
const parseTensorFlow = require('../utils/parse/parse-tensorflow')
const writeFile = require('../utils/write_file/write-file')
const runTensorFlow = require('../utils/tensorflow/run-tensorflow')
const verify = require('../utils/auth/verify')

// controllers
const authController = require('../controllers/auth-controller')

// routes
router.get('/', (request, response, next) => {
    response.status(200).send({
        'GitHub': 'https://github.com/radiantdinosaurs/slothbucket',
        'Docs': 'https://github.com/radiantdinosaurs/slothbucket#readme'
    })
})
router.post('/sloth-check', verify.requiresToken, (request, response) => {
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
router.post('/register', authController.post_register)
router.post('/login', authController.post_login)

module.exports = router
