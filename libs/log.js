var winston = require('winston');

function getLogger(module) {

    return new winston.Logger({
        transports: [
            new winston.transports.File({
                level          : 'info',
                label          : getLogLabel(module),
                filename       : process.cwd() + '/logs/all.log',
                handleException: true,
                json           : true,
                maxSize        : 5242880, //5mb
                maxFiles       : 2,
                colorize       : false
            }),
            new winston.transports.Console({
                colorize       : true,
                level          : 'debug',
                label          : getLogLabel(module),
                handleException: true,
                json           : false
            })
        ]
    });
}

function getLogLabel(module) {
    var path = module.filename.split('/').slice(-2).join('/'); //отобразим метку с именем файла, который выводит сообщение
    var now = new Date();
    var time = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '::' + now.getMilliseconds();
    return time + ' -- ' + path;
}

module.exports = getLogger;