'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const saltRounds = 10

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

const User = mongoose.model('Users', UserSchema)
module.exports = User
