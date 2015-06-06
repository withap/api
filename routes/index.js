var path     = require('path'),
    libs     = process.cwd() + '/libs/',
    passport = require('passport'),
    oauth2   = require(libs + 'auth/oauth2');

module.exports = function (app) {

    app.use('/', require('./main'));
    app.use('/oauth/token', oauth2.token);

    app.use('/posts', require('./posts'));
    app.use('/areas', require('./areas'));
    app.use('/user', require('./user'));
    app.use('/clients', require('./clients'));
    //app.use('/images', require('./images'));
};