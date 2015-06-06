// TODO: This rout not working

var express  = require('express'),
    router   = express.Router(),
    log      = require('libs/log')(module),
    passport = require('passport'),
    Image    = require('model/image').ImageModel,
    Post     = require('model/post').PostModel,
    fs       = require('fs'),
    path     = require('path');
// define the home page route

router.get('/my', passport.authenticate('bearer', {session: false}), function (req, res) {
    Image.find({creatorId: req.user.userId}, function (err, images) {
        if (!err) {
            res.statusCode = 200;
            return res.json({
                status: false,
                images: images
            });
        } else {
            res.statusCode = 500;

            log.error('Internal error(%d): %s', res.statusCode, err.message);

            return res.json({
                status: false,
                errors: err
            });
        }
    });
});

router.post('/post/:postId', passport.authenticate('bearer', {session: false}), function (req, res) {
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

                        var image = new Image({
                            url      : target_path,
                            extension: path.extname(target_path),
                            post     : postId,
                            creator  : req.user.userId
                        });

                        log.info('Uploaded TO: ' + target_path + '  SYZE - ' + file.size + ' bytes');

                        Image.uploadToCloudinary(image, function (err, image) {
                            if (err) {
                                res.statusCode = 400;
                                res.json({
                                    status: false,
                                    errors: 'Validation error'
                                });

                            } else {
                                log.info("Image attached id: %s", image.id);

                                fs.unlink(target_path, function (err) {
                                    if (err) throw err;
                                    log.info('successfully deleted ' + target_path);
                                });

                                post.media = true;
                                post.save(err);

                                if (err) {
                                    log.error(err);
                                }
                                return res.json({
                                    status: true,
                                    image : image
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

router.get('/post/:postId', passport.authenticate('bearer', {session: false}), function (req, res) {
    var postId = req.params.postId;
    Post.findById(postId, function (err, post) {
        if (post) {

            Image.find({postId: postId}, function (err, images) {
                if (!err) {
                    res.statusCode = 200;
                    return res.json({
                        status: true,
                        images: images
                    });
                } else {
                    res.statusCode = 500;

                    log.error('Internal error(%d): %s', res.statusCode, err.message);

                    return res.json({
                        status: false,
                        errors: err
                    });
                }
            });

        } else {
            if (err) {
                res.statusCode = 500;
                res.json({
                    status: false,
                    errors: err
                });
            } else {
                res.statusCode = 404;
                res.json({
                    status: false
                });
            }
        }
    });
});

router.post('/', passport.authenticate('bearer', {session: false}), function (req, res) {
    var image = new Image({
        url    : req.body.url,
        post   : req.body.postId,
        creator: req.user.userId
    });

    Image.uploadToCloudinary(image, function (err, image) {
        if (err) {
            log.error(err)
            res.json({
                status: false,
                errors: err
            });
        } else {
            res.statusCode = 201;
            res.json({
                status: true,
                image : image
            });
            log.info("User AUTH with id: %s", image.id);
        }
    });
});

router.delete('/', function (req, res) {
    Image.remove(function (err, images) {
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