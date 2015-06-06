var express        = require('express'),
    cors           = require('cors'),
    path           = require('path'),
    libs           = process.cwd() + '/libs/',
    logger         = require('morgan'),
    bodyParser     = require('body-parser'),
    favicon        = require('serve-favicon'),
    methodOverride = require('method-override'),
    connect        = require('connect'),
    log            = require(libs + 'log')(module),
    cookieParser   = require('cookie-parser'),
    config         = require('config'),
    mongoose       = require(libs + 'mongoose'),
    http           = require('http'),
    passport       = require('passport'),
    multer         = require('multer'),
    app            = express();

app.use(passport.initialize());
app.use(multer({dest: path.join(__dirname, '/public/uploads')}));
app.set('uploadDir', path.join(__dirname, '/public/uploads'));
app.use(logger('dev'));
process.env.TZ = config.get('timeZone');
app.use(cors());
app.use(favicon(__dirname + '/public/favicon.ico')); // отдаем стандартную фавиконку, можем здесь же свою задать
app.use(bodyParser.urlencoded({extended: false}));// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser(config.get('session:secret')));
app.use(methodOverride('X-HTTP-Method-Override')); // поддержка put и delete
app.use(express.static(path.join(__dirname, "public"))); // запуск статического файлового сервера, который смотрит на папку public/ (в нашем случае отдает index.html)

require(libs + 'auth/auth');
require('routes')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({
        error: 'Not found'
    });
    return;
});
// error handlers
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);
    res.json({
        error: err.message
    });
    return;
});

//res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
//res.header('Access-Control-Allow-Origin', '*');

var server = http.createServer(app);
server.on('request', function (req, res) {
    log.info('___REQUEST___ Method: ' + req.method + ' | Url: ' + req.url || req.baseUrl);//req.originUrl
});
server.listen(config.get('port'), function () {
    log.info('Express sever listening on port ' + config.get('port'));
});
