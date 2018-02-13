'use strict'

const { body } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')

const validateUserRegistrationForm = [
    body('username').trim().isLength({ min: 1 }).withMessage('Username must be specified'),
    body('email').isEmail().withMessage('Valid email must be provided'),
    body('password').isLength({ min: 10 }).withMessage('Password must be at least 10 characters long'),
    body('password').matches(/\d/).withMessage('Password must contain at least one number'),
    body('password').matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter'),
    body('password').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
    body('passwordConfirmation').custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords don\'t match'),
    sanitizeBody('username').trim().escape(),
    sanitizeBody('email').trim().escape()
]

const validateLoginForm = [
    body('username').trim().isLength({ min: 1 }).withMessage('Username must be specified'),
    body('password').exists().withMessage('Password is required'),
    sanitizeBody('email').trim().escape()
]

module.exports.validateUserRegistrationForm = validateUserRegistrationForm
module.exports.validateLoginForm = validateLoginForm
