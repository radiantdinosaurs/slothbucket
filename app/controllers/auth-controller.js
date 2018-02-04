'use strict'

const { validationResult } = require('express-validator/check')
const jwt = require('jsonwebtoken')
const userController = require('../controllers/user-controller')
const validate = require('../utils/auth/validate')
const logger = require('../utils/log/logger')
const verify = require('../utils/auth/verify')
const config = require('../config')

exports.post_register = [
    validate.validateUserRegistrationForm,
    (request, response) => {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            errors.formatWith(({location, param, value, msg}) => msg) // removes all but the error message
            response.status(400).send({status: 400, error: errors.array()})
        } else {
            const userData = {
                username: request.body.username,
                display_name: request.body.username,
                email: request.body.email,
                password: request.body.password
            }
            userController.createUser(userData).then((user) => {
                const token = jwt.sign({id: user._id}, config.secret, {expiresIn: 86400}) // expires in one day
                response.status(200).send({ auth: true, token: token, user_id: user._id })
            }).catch((error) => {
                logger.log('error', error)
                response.status(error.code).send({status: error.code, error: error.message})
            })
        }
    }
]

exports.post_login = [
    validate.validateLoginForm,
    (request, response) => {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            errors.formatWith(({location, param, value, msg}) => msg) // removes all but the error message
            response.status(400).send({status: 400, error: errors.array()})
        } else {
            const username = request.body.username
            const password = request.body.password
            // first, find the user in the database
            userController.findUser(username).then((user) => {
                // next, verify the password they provided in the request body
                verify.verifyPassword(user, password).then(() => {
                    let token = jwt.sign({id: user._id}, config.secret, {expiresIn: 86400}) // expires in one day
                    response.status(200).send({ auth: true, token: token, user_id: user._id })
                }).catch((error) => {
                    logger.log('error', error)
                    response.status(error.code).send({status: error.code, error: error.message})
                })
            }).catch((error) => {
                logger.log('error', error)
                response.status(error.code).send({status: error.code, error: error.message})
            })
        }
    }
]
