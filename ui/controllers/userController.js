'use strict'

const { body, validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')
const logger = require('../utils/logging/logger')
const User = require('../models/user')

exports.get_register = (request, response, next) => {
    response.status(200).render('register', { title: 'Register' })
}

exports.get_login = (request, response, next) => {
    response.status(200).render('login', { title: 'Login' })
}

exports.get_profile = (request, response, next) => {
    return User.findById(request.session.userId).exec((error, user) => {
        if (error) {
            logger.log('error', error)
            next(error)
        } else {
            response.status(200)
                .render('profile', { displayName: user.display_name, username: user.username, email: user.email })
        }
    })
}

exports.post_register = [
    body('username').trim().isLength({ min: 1 }).withMessage('Username must be specified'),
    body('email').isEmail().withMessage('Valid email must be provided'),
    body('password').isLength({ min: 10 }).withMessage('Password must be at least 10 characters long'),
    body('password').matches(/\d/).withMessage('Password must contain at least one number'),
    body('password').matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter'),
    body('password').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
    body('passwordConfirmation').custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords don\'t match'),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('email').trim().escape(),
    function(request, response, next) {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            response.status(200).render('register', { title: 'Register', user: request.body, errors: errors.array() })
        } else {
            const userData = {
                username: request.body.username,
                display_name: request.body.username,
                email: request.body.email,
                password: request.body.password
            }
            User.create(userData, (error, user) => {
                if (error) {
                    if (error.code === 11000) {
                        // error.code indicates a user was found
                        let error = [{ msg: 'Username or email already exists' }]
                        response.status(200).render('register', { user: request.body, errors: error })
                    } else {
                        logger.log('error', error)
                        return next(error)
                    }
                } else {
                    // save the session for two weeks if the user checked the 'remember' box
                    if (request.body.remember) request.session.cookie.maxAge = 14 * 24 * 3600000
                    request.session.userId = user._id
                    response.status(200).redirect('/profile')
                }
            })
        }
    }
]

exports.post_login = [
    body('username').trim().isLength({ min: 1 }).withMessage('Username must be specified'),
    body('password').exists().withMessage('Password is required'),
    sanitizeBody('email').trim().escape(),
    function(request, response, next) {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            response.status(200).render('login', { title: 'Login', errors: errors.array() })
        } else {
            User.authenticate(request.body.username, request.body.password, function(error, user) {
                if (error) {
                    if (error.status === 401) {
                        let error = [{ msg: 'Incorrect email or password' }]
                        response.status(200).render('login', { title: 'Login', errors: error })
                    } else {
                        logger.log('error', error)
                        return next(error)
                    }
                } else {
                    // save the session for two weeks if the user checked the 'remember' box
                    if (request.body.remember) request.session.cookie.maxAge = 14 * 24 * 3600000
                    request.session.userId = user._id
                    response.redirect('/profile')
                }
            })
        }
    }
]

exports.logout = function logOut(request, response, next) {
    if (request.session) {
        request.session.destroy(function(error) {
            if (error) {
                logger.log('error', error)
                return next(error)
            } else return response.clearCookie('connect.sid', { path: '/' }).status(200).redirect('/')
        })
    } else response.status(200).redirect('/login')
}
