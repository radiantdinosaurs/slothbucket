'use strict'

const express = require('express')
const router = express.Router()
const auth = require('../utils/authentication/authentication')

// controllers
const userController = require('../controllers/userController')

router.get('/', function(request, response, next) {
    response.status(200).render('index', { title: 'Slothbucket' })
})

router.get('/register', auth.loggedOut, userController.get_register)

router.get('/login', auth.loggedOut, userController.get_login)

router.get('/profile', auth.requiresLogin, userController.get_profile)

router.post('/register', userController.post_register)

router.post('/login', userController.post_login)

router.get('/logout', userController.logout)

module.exports = router
