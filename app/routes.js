'use strict'

const express = require('express')
const router = express.Router()
const security = require('./security/index')
const registration = require('./registration/index')
const classifyImage = require('./classify_image/index')

router.get('/', (request, response) => {
    response.status(200).send({
        'GitHub': 'https://github.com/radiantdinosaurs/slothbucket',
        'Docs': 'https://github.com/radiantdinosaurs/slothbucket#readme'
    })
})
router.post('/classify-image', classifyImage.handleClassifyImage)
router.post('/register', registration.handleRegistration)
router.post('/authenticate', security.handleAuthentication)

module.exports = router
