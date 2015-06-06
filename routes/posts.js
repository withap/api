var express  = require('express'),
    log      = require('libs/log')(module),
    router   = express.Router(),
    passport = require('passport'),
    fs       = require('fs'),
    path     = require('path'),
    Post     = require('model/post').PostModel;
//multer   = require('multer');
var populateUser = {
    'username': true,
    'nickname': true,
    'image'   : true
};
// define the home page route

router.get('/', passport.authenticate('bearer', {session: false}), function (req, res) {
    Post.find({}).populate('creator', populateUser).exec(function (err, posts) {
        if (!err) {
            res.statusCode = 200;
            return res.json({
                status: true,
                posts : posts
            });
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                error: 'Server error'
            });
        }
    });
});

router.get('/my', passport.authenticate('bearer', {session: false}), function (req, res) {

    Post.find({creator: req.user.userId}, function (err, posts) {
        if (!err) {
            res.statusCode = 200;
            return res.json({
                status: true,
                posts : posts
            });
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                error: 'Server error'
            });
        }
    });
});

router.get('/user/:userId', passport.authenticate('bearer', {session: false}), function (req, res) {

    Post.find({creator: req.params.userId}, function (err, posts) {
        if (!err) {
            res.statusCode = 200;
            return res.json({
                status: true,
                posts : posts
            });
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                error: 'Server error'
            });
        }
    });
});

//router.post('/1',[ multer({ dest: 'public/uploads/'}), function(req, res){
//    console.log(req.body) // form fields
//    console.log(req.files) // form files
//    res.status(204).end()
//}]);

router.post('/', passport.authenticate('bearer', {session: false}), function (req, res, next) {

    var post = new Post({
        content : req.body.content,
        loc     : {
            type       : "Point",
            coordinates: [parseFloat(req.body.lat.replace(",", ".")), parseFloat(req.body.lng.replace(",", "."))]
        },
        category: req.body.category || 'Post',
        creator : req.user.userId
    });

    post.save(function (err) {

        if (!err) {
            res.statusCode = 201;
            log.info("New Post created with id: %s", post.id);
            res.json({
                status: true,
                post  : post
            });
        } else {
            if (err.name === 'ValidationError') {
                res.statusCode = 400;
                res.json({
                    status: false,
                    error : 'Validation error'
                });
            } else {
                res.statusCode = 500;
                res.json({
                    status: false,
                    error : err
                });
            }
            log.error('Internal error(%d): %s', res.statusCode, err.message);
        }
    });
});

router.post('/:postId/image', passport.authenticate('bearer', {session: false}), function (req, res) {
    var CloudinaryApi = require('services/cloudinary');
    var postId = req.params.postId;
    if (req.files.image != undefined) {
        //image = setImageToPost(req.files.image, post);
        var file = req.files.image;
        var tmp_path = file.path;
        var target_path = 'public/uploads/images/' + file.name;

        Post.findById(postId, function (err, post) {
            if (post) {
                fs.rename(tmp_path, target_path, function (err) {
                    if (err) throw err;
                    fs.unlink(tmp_path, function () {
                        if (err) throw err;

                        var image = {
                            url      : target_path,
                            extension: path.extname(target_path),
                            post     : postId,
                            creator  : req.user.userId
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

                                post.media = true;
                                post.image = image.url;
                                post.save(err);

                                if (err) {
                                    log.error(err);
                                }
                                return res.json({
                                    status: true,
                                    post  : post
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
                        errors: 'Post not found'
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

router.get('/:id', function (req, res) {
    Post.findById(req.params.id).populate('creator', populateUser).exec(function (err, post) {
        if (!post) {
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
                    post  : post
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

router.get('/byLocation/:lat/:lng/:radius', function (req, res, next) {
    var lat = req.params.lat;
    var lng = req.params.lng;
    var radius = req.params.radius;

    Post.getByLocate(lat, lng, radius, function (err, posts) {
        if (err) {
            if (res.statusCode == 200) {
                res.json({
                    status: false,
                    error : err
                });
            } else {
                res.statusCode = 500;
                next({message: err, status: 500});
                log.error(err)
                return next(err);
            }

        } else {
            res.statusCode = 200;
            res.json({
                status: true,
                posts : posts
            });
        }

    });
});

router.put('/:id', passport.authenticate('bearer', {session: false}), function (req, res) {
    var postId = req.params.id;

    Post.findById(postId, function (err, post) {
        if (!post) {
            res.statusCode = 404;
            log.error('Post with id: %s Not Found', postId);
            return res.json({
                status: false,
                error : 'Not found'
            });
        }
        post.content = req.body.content;

        post.save(function (err) {
            if (!err) {
                log.info("Post with id: %s updated", post.id);
                return res.json({
                    status: true,
                    post  : post
                });
            } else {

                log.error('Internal error (%d): %s', res.statusCode, err.message);
                if (err.name === 'ValidationError') {
                    res.statusCode = 400;
                    return res.json({
                        status: false,
                        error : 'Validation error'
                    });
                } else {
                    res.statusCode = 500;

                    return res.json({
                        status: false,
                        error : 'Server error'
                    });
                }
            }
        });
    });
});

router.delete('/:id', function (req, res) {
    Post.findById(req.params.id, function (err, post) {
        return post.remove(function (err) {
            if (!err) {
                res.statusCode = 200;
                return res.json({
                    status: true
                });
            } else {
                if (!post) {
                    res.statusCode = 404;
                    return res.json({
                        status: false
                    });
                } else {
                    res.statusCode = 500;
                    return res.send({
                        status: false,
                        error : err
                    });
                }
            }
        });
    });
});

router.delete('/', function (req, res) {
    Post.remove(function (err, posts) {
        if (!err) {
            log.info("Posts deleted");
            res.statusCode = 200;
            return res.json({
                status: true
            });
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                status: false,
                error : 'Server error'
            });
        }
    });
});

module.exports = router;