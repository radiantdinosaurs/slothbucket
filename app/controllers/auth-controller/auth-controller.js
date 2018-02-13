'use strict'

const validationResult = require('express-validator/check').validationResult
const jwt = require('jsonwebtoken')
const userController = require('../user-controller/user-controller')
const validate = require('../../utils/auth/validate')
const logger = require('../../utils/log/logger')
const verify = require('../../utils/auth/verify')
const SECRET = process.env.SECRET

exports.post_register = [
    validate.validateUserRegistrationForm,
    function postRegister(request, response) {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            errors.formatWith(({location, param, value, msg}) => msg) // removes all but the error message
            response.status(200).send({status: 200, error: errors.array()})
        } else {
            const user = {
                username: request.body.username,
                display_name: request.body.username,
                email: request.body.email,
                password: request.body.password
            }
            userController.createUser(user).then((result) => {
                const userId = result._id
                const token = jwt.sign({id: userId}, SECRET, {expiresIn: 86400}) // expires in one day
                response.status(201).send({auth: true, token: token, user_id: userId})
            }).catch((error) => {
                logger.log('error', error)
                response.status(error.code).send({status: error.code, error: error.message})
            })
        }
    }
]

exports.post_login = [
    validate.validateLoginForm,
    function postLogin(request, response) {
        let errors = validationResult(request)
        if (!errors.isEmpty()) {
            errors.formatWith(({location, param, value, msg}) => msg) // removes all but the error message
            response.status(200).send({status: 200, error: errors.array()})
        } else {
            const user = {
                username: request.body.username,
                password: request.body.password
            }
            // first, find the user in the database
            userController.findUser(user.username).then((result) => {
                // next, verify the password they provided in the request body
                verify.verifyPassword(result.password, user.password).then(() => {
                    const userId = result._id
                    let token = jwt.sign({id: userId}, SECRET, {expiresIn: 86400}) // expires in one day
                    response.status(200).send({auth: true, token: token, user_id: userId})
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
