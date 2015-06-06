var express = require('express');
var log = require('libs/log')(module);
var router = express.Router();
var passport = require('passport');

var Area = require('model/area').AreaModel;
// define the home page route

router.get('/', passport.authenticate('bearer', {session: false}), function (req, res) {
    Area.find({creator: req.user.userId}, function (err, areas) {
        if (!err) {
            res.statusCode = 200;
            return res.json({
                status: true,
                areas : areas
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

router.post('/', passport.authenticate('bearer', {session: false}), function (req, res) {
    var area = new Area({
        title  : req.body.title || null,
        loc    : {
            type       : "Point",
            coordinates: [req.body.lat, req.body.lng]
        },
        radius : req.body.radius,
        creator: req.user.userId
    });

    area.save(function (err) {
        if (!err) {
            res.statusCode = 201;
            log.info("New area created with id: %s", area.id);
            return res.json({
                status: true,
                area  : area
            });
        } else {
            if (err.name === 'ValidationError') {
                res.statusCode = 400;
                res.json({
                    status: false,
                    error : err
                });
            } else {
                res.statusCode = 500;

                log.error('Internal error(%d): %s', res.statusCode, err.message);

                res.json({
                    status: true,
                    error : 'Server error'
                });
            }


        }
    });
});

router.get('/:id', passport.authenticate('bearer', {session: false}), function (req, res) {
    Area.findById(req.params.id, function (err, area) {
        if (!area) {
            res.statusCode = 404;

            return res.json({
                status: false,
                error : 'Not found'
            });
        }

        if (!err) {
            res.statusCode = 200;
            return res.json({
                status: true,
                area  : area
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

router.get('/:id/posts', passport.authenticate('bearer', {session: false}), function (req, res) {
    Area.findById(req.params.id, function (err, area) {
        if (!area) {
            res.statusCode = 404;

            return res.json({
                status: false,
                error : 'Not found'
            });
        }

        if (!err) {
            var Post = require('model/post').PostModel;

            var lat = area.loc.coordinates[0];
            var lng = area.loc.coordinates[1];
            var radius = area.radius;

            Post.getByLocate(lat, lng, radius, function (err2, posts) {
                if (err2) {
                    log.error(err2)

                    res.json({
                        status: false,
                        error : err2
                    });
                } else {
                    res.statusCode = 200;
                    res.json({
                        status: true,
                        posts : posts
                    });
                }

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

router.put('/:id', passport.authenticate('bearer', {session: false}), function (req, res) {
    var areaId = req.params.id;

    Area.findById(areaId, function (err, area) {
        if (!are) {
            res.statusCode = 404;
            log.error('Area with id: %s Not Found', areaId);
            return res.json({
                status: false,
                error : 'Not found'
            });
        }
        area.description = req.body.description;

        area.save(function (err) {
            if (!err) {
                log.info("Article with id: %s updated", area.id);
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

router.delete('/:id', passport.authenticate('bearer', {session: false}), function (req, res) {
    Area.findById(req.params.id, function (err, area) {
        return area.remove(function (err) {
            if (!err) {
                res.statusCode = 200;

                return res.json({
                    status: true
                });
            } else {
                if (!area) {
                    res.statusCode = 404;

                    return res.json({
                        status: false
                    });
                } else {
                    res.statusCode = 500;

                    return res.json({
                        status: false,
                        error : err
                    });
                }
            }
        });
    });
});

router.delete('/', function (req, res) {
    Area.remove(function (err, areas) {
        if (!err) {
            log.info("Posts deleted");
            res.statusCode = 200;
            return res.json({
                status: true,
                areas : areas
            });
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

module.exports = router;