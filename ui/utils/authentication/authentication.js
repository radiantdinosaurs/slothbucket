'use strict'

function requiresLogin(request, response, next) {
    if (request.session && request.session.userId) {
        return next()
    } else {
        let error = [ { msg: 'You must be logged in to view this page' } ]
        error.status = 401
        response.render('login', { title: 'Login', errors: error })
    }
}

function loggedOut(request, response, next) {
    if (request.session && request.session.userId) {
        return response.redirect('/profile')
    }
    return next()
}

module.exports.requiresLogin = requiresLogin
module.exports.loggedOut = loggedOut
