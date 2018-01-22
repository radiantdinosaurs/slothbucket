const express = require('express')
const router = express.Router()

router.get('/', function(request, response, next) {
    response.render('index', { title: 'Slothbucket' })
})

module.exports = router
