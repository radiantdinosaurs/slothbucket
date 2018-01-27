'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const saltRounds = 10
const logger = require('../utils/logging/logger')

const UserSchema = new Schema({
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        trim: true
    },
    display_name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
})

// salt and hash the password before saving the user to the database
UserSchema.pre('save', function(next) {
    let user = this
    bcrypt.hash(user.password, saltRounds, (error, hash) => {
        if (error) {
            return next(error)
        }
        user.password = hash
        next()
    })
})

// authenticate login against database
UserSchema.statics.authenticate = function(username, password, callback) {
    return User.findOne({ username: username }).exec(function(error, user) {
        if (error) {
            logger.log('error', error)
            error.status = 500
            callback(error)
        } else if (!user) {
            error.status = 401
            callback(error)
        } else {
            bcrypt.compare(password, user.password, function(error, result) {
                if (error) {
                    logger.log('error', error)
                    error.status = 500
                    callback(error)
                } else if (result) {
                    callback(null, user)
                } else {
                    const error = new Error()
                    error.status = 401
                    callback(error)
                }
            })
        }
    })
}

const User = mongoose.model('Users', UserSchema)
module.exports = User
