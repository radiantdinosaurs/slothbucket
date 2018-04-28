$(document).ready(function() {
    $('.open-menu').click(function() {
        $('.menu').slideDown('fast')
        $('.layout-container').css('filter', 'blur(2px)')
    })
    $('.close-menu').click(function() {
        $('.menu').slideUp('fast')
        $('.layout-container').css('filter', 'blur(0px)')
    })

    $('#login-header-button').click(function() {
        $('.layout-container').css('filter', 'blur(2px)')
        $('.login-form-container').css('display', 'flex')
    })

    $('#login-menu-button').click(function() {
        $('.menu').slideUp('fast')
        $('.layout-container').css('filter', 'blur(2px)')
        $('.login-form-container').css('display', 'flex')
    })

    $('#close-login-form').click(function() {
        $('.login-form-container').hide('fast')
        $('.menu-container').css('filter', 'blur(0px)')
        $('.layout-container').css('filter', 'blur(0px)')
    })

    $('#register-password').focus(function() {
        $('#password-information').show('fast')
    }).blur(function() {
        $('#password-information').hide('fast')
    })

    $('.index-block form input').change(function() {
        $('form p').text(this.files[0].name)
    })
})
