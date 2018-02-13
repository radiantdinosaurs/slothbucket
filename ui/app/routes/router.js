'use strict'

const express = require('express')
const router = express.Router()
const verifySession = require('../middlewares/auth/verify-session')

// controllers
const authController = require('../controllers/auth-controller/auth-controller')

// routes
router.get('/', (request, response, next) => {
    response.status(200).render('index', { page: 'Slothbucket' })
})
router.get('/register', verifySession.requiresLogout, authController.get_register)
router.get('/login', verifySession.requiresLogout, authController.get_login)
router.post('/register', authController.post_register)
router.post('/login', authController.post_login)
router.get('/logout', verifySession.requiresLogin, authController.logout)

module.exports = router
