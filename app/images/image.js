'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    file_path: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    user_id: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }]
})

const Image = mongoose.model('Image', ImageSchema)
module.exports = Image
