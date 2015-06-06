var express = require('express');
var log = require('libs/log')(module);
var router = express.Router();
var passport = require('passport');

var Client = require('model/client');
// define the home page route

router.get('/all', function (req, res) {
    log.info("All Users");
    Client.find(function (err, clients) {
        if (!err) {
            res.statusCode = 200;
            return res.json({
                status : true,
                clients: clients
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

router.post('/', function (req, res, next) {
    var client = new Client({
        name        : req.body.name,
        clientId    : req.body.clientId,
        clientSecret: req.body.clientSecret
    });

    client.save(function (err) {

        if (!err) {
            res.statusCode = 201;
            log.info("New Client created with id: %s", client.id);
            res.json({
                status: true,
                client: client
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

module.exports = router;