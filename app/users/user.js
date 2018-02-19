'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema
const logger = require('../logging/index')

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
    },
    created: {
        type: Date,
        default: Date.now
    }
})

UserSchema.pre('save', function saltAndHashPassword(next) {
    const saltRounds = 10
    let user = this
    bcrypt.hash(user.password, saltRounds, (error, hash) => {
        if (error) {
            logger.log('error', error)
            return next(error)
        } else {
            user.password = hash
            next()
        }
    })
})

const User = mongoose.model('Users', UserSchema)
module.exports = User
