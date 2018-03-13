'use strict'

const express = require('express')
const router = express.Router()
const registration = require('./registration/index')
const session = require('./session/index')
const uploadImage = require('./upload_image/index')
const imageLibraryController = require('./images/index')

router.get('/', (request, response, next) => {
    response.status(200).render('index', { page: 'Slothbucket' })
})
router.get('/about', (request, response, next) => {
    response.status(200).render('about', { page: 'Slothbucket: About' })
})
router.get('/contact', (request, response, next) => {
    response.status(200).render('contact', { page: 'Slothbucket: Contact' })
})
router.get('/register', session.requiresLogout, registration.getRegister)
router.post('/register', registration.postRegister)
router.get('/login', session.requiresLogout, session.getLogin)
router.post('/login', session.postLogin)
router.post('/upload-image', session.requiresLogin, uploadImage.uploadImage)
router.get('/logout', session.requiresLogin, session.logout)
router.get('/images', session.requiresLogin, imageLibraryController.handleImageLibraryRoute)

module.exports = router
