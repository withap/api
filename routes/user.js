var express  = require('express'),
    log      = require('libs/log')(module),
    router   = express.Router(),
    passport = require('passport'),
    fs       = require('fs'),
    path     = require('path'),
    User     = require('model/user').UserModel;
// define the home page route

var userProps = {
    'username' : true,
    'nickname' : true,
    'image'    : true,
    'createdAt': true
};

router.get('/all', function (req, res) {
    User.find(function (err, users) {
        if (!err) {
            res.statusCode = 200;
            return res.json({
                status: true,
                users : users
            });
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                status: true,
                error : 'Server error'
            });
        }
    });
});

router.get('/me', passport.authenticate('bearer', {session: false}), function (req, res) {
        // req.authInfo is set using the `info` argument supplied by
        // `BearerStrategy`.  It is typically used to indicate scope of the token,
        // and used in access control checks.  For illustrative purposes, this
        // example simply returns the scope in the response.
        res.json({
            status  : true,
            user    : req.user,
            authInfo: req.authInfo
        });
    }
);

router.get('/:userId', passport.authenticate('bearer', {session: false}), function (req, res) {
    User.findById(req.params.userId, userProps, function (err, user) {
        if (!user) {
            res.statusCode = 404;

            return res.json({
                status: false,
                error : 'Not found'
            });
        }

        if (!err) {
            res.statusCode = 200;
            return res.json(
                {
                    status: true,
                    user  : user
                }
            );
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                status: false,
                error : err
            });
        }
    });
});

router.delete('/allUsers', function (req, res) {
    User.remove({}, function (err) {
        if (!err) {
            res.statusCode = 200;
            return res.json({status: true});
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                status: false,
                error : err
            });
        }
    });
});

router.post('/registration', function (req, res, next) {
    var user = new User({
        username: req.body.username,
        password: req.body.password
    });

    User.registration(user, function (err, user) {
        if (err) {
            res.statusCode = 500;
            res.json({
                status: false,
                error : err
            });
        } else {
            res.statusCode = 201;
            res.json({
                status: true,
                user  : user
            });
            log.info("New user created with id: %s", user.id);
            console.log(user);
        }
    });
});

router.put('/myProfile', passport.authenticate('bearer', {session: false}), function (req, res, next) {

    User.findById(req.user.userId, function (err, user) {
        if (!user) {
            res.statusCode = 404;
            log.error('User with id: %s Not Found', req.user.userId);
            return res.json({
                status: false,
                error : 'Not found'
            });
        } else {
            res.statusCode = 500;
            return res.json({
                status: false,
                error : 'Function not working'
            });
        }

        user.username = req.body.username;

        user.save(function (err) {
            if (!err) {
                log.info("User with id: %s updated", user.id);
                return res.json({
                    status: 'OK',
                    user  : user
                });
            } else {
                if (err.name === 'ValidationError') {
                    res.statusCode = 400;
                    return res.json({
                        error: 'Validation error'
                    });
                } else {
                    res.statusCode = 500;

                    return res.json({
                        error: 'Server error'
                    });
                }

                log.error('Internal error (%d): %s', res.statusCode, err.message);
            }
        });
    });
});

router.post('/image', passport.authenticate('bearer', {session: false}), function (req, res) {
    var CloudinaryApi = require('services/cloudinary');
    if (req.files.image != undefined) {
        //image = setImageToPost(req.files.image, post);
        var file = req.files.image;
        var tmp_path = file.path;
        var target_path = 'public/uploads/images/' + file.name;

        User.findById(req.user.userId, function (err, user) {
            if (user) {
                fs.rename(tmp_path, target_path, function (err) {
                    if (err) throw err;
                    fs.unlink(tmp_path, function () {
                        if (err) throw err;

                        var image = {
                            url      : target_path,
                            extension: path.extname(target_path),
                            creator  : req.user.userId,
                            avatar   : 1
                        };

                        CloudinaryApi.uploadToCloudinary(image, function (err, image) {
                            if (err) {
                                res.statusCode = 400;
                                res.json({
                                    status: false,
                                    errors: 'Validation error'
                                });

                            } else {
                                fs.unlink(target_path, function (err) {
                                    if (err) throw err;
                                });

                                user.image = image.url;
                                user.save(err);

                                if (err) {
                                    log.error(err);
                                }
                                return res.json({
                                    status: true,
                                    user  : user
                                });
                            }
                        });
                    });
                });
            } else {
                if (!err) {
                    res.statusCode = 400;
                    res.json({
                        status: false,
                        errors: 'User not found'
                    });
                } else {
                    res.statusCode = 500;
                    res.json({
                        status: false,
                        errors: err
                    });
                }
            }
        });
    } else {
        res.statusCode = 400;
        res.json({
            status: false
        });
    }
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['read_stream', 'publish_actions']}));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', function (req, res, next) {
        log.debug('FACE BOOK AUTH');

        console.log(req);
        console.log(res);
    }));

module.exports = router;