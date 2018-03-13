'use strict'

const express = require('express')
const router = express.Router()
const security = require('./security/index')
const registration = require('./registration/index')
const classifyImage = require('./classify_image/index')
const imageLibraryController = require('./image_library/index')

router.get('/', (request, response) => {
    response.status(200).send({
        'GitHub': 'https://github.com/radiantdinosaurs/slothbucket',
        'Docs': 'https://github.com/radiantdinosaurs/slothbucket#readme'
    })
})
router.get('/api/v1/images/:id', security.requiresToken, imageLibraryController.handleImageLibraryRoute)
router.post('/api/v1/images/classify', security.requiresToken, classifyImage.handleClassifyImage)
router.post('/api/v1/register', registration.handleRegistration)
router.post('/api/v1/authenticate', security.handleAuthentication)

module.exports = router
