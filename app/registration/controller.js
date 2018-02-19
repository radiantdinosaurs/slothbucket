'use strict'

const validationResult = require('express-validator/check').validationResult
const jwt = require('jsonwebtoken')
const userController = require('../users/index')
const validate = require('../security/form-validation')
const logger = require('../logging/index')
const SECRET = process.env.SECRET

// handler for user registration route
const handleRegistrationRoute = [
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

module.exports = {
    handleRegistration: handleRegistrationRoute
}
