'use strict'

const fs = require('fs')
const logger = require('../logging/index')

function deleteFileIfExists(fileName) {
    if (fileName && fs.existsSync('saved_images/' + fileName)) {
        fs.unlink('saved_images/' + fileName, (error) => {
            if (error) logger.log('error', error)
        })
    }
}

module.exports = {
    deleteFileIfExists: deleteFileIfExists
}
