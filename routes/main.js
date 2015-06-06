var express = require('express');
var log = require('libs/log');
var router = express.Router();

var Post = require('model/post').PostModel;
// define the home page route

router.get('/', function (req, res) {

    res.json({"title": "API is working!"});

});

module.exports = router;