//passport modules
var passport               = require('passport'),
    //BasicStrategy          = require('passport-http').BasicStrategy,
    LocalStrategy          = require('passport-local').Strategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy         = require('passport-http-bearer').Strategy,
    FacebookStrategy       = require('passport-facebook').Strategy,
    //models
    User                   = require('model/user').UserModel,
    Client                 = require('model/client'),
    AccessToken            = require('model/accessToken'),
    RefreshToken           = require('model/refreshToken');

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require('config');

//passport.use(new BasicStrategy(
//    function(username, password, done) {
//        Client.findOne({ clientId: username }, function(err, client) {
//            if (err) {
//                return done(err);
//            }
//
//            if (!client) {
//                return done(null, false);
//            }
//
//            if (client.clientSecret !== password) {
//                return done(null, false);
//            }
//
//            return done(null, client);
//        });
//    }
//));

passport.use('local', new LocalStrategy(
    function (username, password, done) {
        console.log('local')
        Client.findOne({clientId: username}, function (err, client) {

            if (err) {
                console.log('err')
                return done(err);
            }

            if (!client) {
                console.log('!client')
                return done(null, false);
            }

            if (client.clientSecret !== password) {
                console.log('client.clientSecret !== password')
                return done(null, false);
            }
            console.log('done local')
            console.log(client)
            return done(null, client);
        });


    }
));

passport.use(new ClientPasswordStrategy(
    function (clientId, clientSecret, done) {
        console.log('client password')

        Client.findOne({clientId: clientId}, function (err, client) {
            if (err) {
                console.log('err')
                return done(err);
            }

            if (!client) {
                console.log('!client')
                return done(null, false);
            }

            if (client.clientSecret !== clientSecret) {
                console.log('client.clientSecret !== clientSecret')
                return done(null, false);
            }

            console.log('done client password')
            console.log(client)
            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function (accessToken, done) {
        AccessToken.findOne({token: accessToken}, function (err, token) {

            if (err) {
                return done(err);
            }

            if (!token) {
                return done(null, false);
            }

            if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife')) {

                AccessToken.remove({token: accessToken}, function (err) {
                    if (err) {
                        return done(err);
                    }
                });

                return done(null, false, {message: 'Token expired'});
            }

            User.findById(token.userId, function (err, user) {

                if (err) {
                    return done(err);
                }

                if (!user) {
                    return done(null, false, {message: 'Unknown user'});
                }

                var info = {scope: '*'};
                done(null, user, info);
            });
        });
    }
));

passport.use(new FacebookStrategy({
        clientID    : config.get('socialApp:fb:appId'),
        clientSecret: config.get('socialApp:fb:secretKey'),
        callbackURL : config.get('siteUrl:api') + '/auth/facebook/callback'
    },
    function (accessToken, refreshToken, profile, done) {
        console.log(accessToken);
        console.log(refreshToken);
        console.log(profile);
        console.log(done);
        User.findOrCreate({username: profile.email}, function (err, user) {
            if (err) {
                return done(err);
            }
            done(null, user);
        });
    }
));