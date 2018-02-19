'use strict'

const express = require('express')
const router = express.Router()
const registration = require('./registration/index')
const session = require('./session/index')

router.get('/', (request, response, next) => {
    response.status(200).render('index', { page: 'Slothbucket' })
})
router.get('/register', session.requiresLogout, registration.getRegister)
router.post('/register', registration.postRegister)
router.get('/login', session.requiresLogout, session.getLogin)
router.post('/login', session.postLogin)
router.get('/logout', session.requiresLogin, session.logout)

module.exports = router
