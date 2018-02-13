'use strict'

/**
 * Verifies that user has an existing, valid session for protected pages
 * @param request {Object} - HTTP request
 * @param response {Object} - HTTP request
 * @param next - callback
 */
function requiresLogin(request, response, next) {
    if (request.session && request.session.userId && request.session.jwt) return next()
    else {
        let error = [{msg: 'You must be logged in to view this page'}]
        error.status = 401
        response.render('login', { title: 'Login', errors: error })
    }
}

/**
 * Verifies that user doesn't have an existing, valid session for some pages (e.g., 'login' page and 'register' page)
 * @param request {Object} - HTTP request
 * @param response {Object} - HTTP request
 * @param next - callback
 */
function requiresLogout(request, response, next) {
    if (request.session && request.session.userId && request.session.jwt) response.redirect('/')
    else next()
}

module.exports.requiresLogin = requiresLogin
module.exports.requiresLogout = requiresLogout
