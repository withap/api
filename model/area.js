var mongoose = require('libs/mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;
var uniqueValidator = require('mongoose-unique-validator');

var AreaSchema = new Schema({
    title     : {
        type    : String,
        required: true,
        default : getDefaultTitleName()
    },
    colorTheme: {
        type    : String,
        required: true,
        default : getRandomColor()
    },
    loc       : {
        type       : {
            type    : String,
            required: true,
            enum    : ['Point', 'LineString', 'Polygon'],
            default : 'Point'
        },
        coordinates: []
    },
    radius    : {
        type   : Number,
        require: true
    },
    creator   : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    createdAt : {
        type   : Date,
        default: Date.now()
    }
});
AreaSchema.index({loc: '2dsphere'});
// validation
AreaSchema.plugin(uniqueValidator);
//userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
AreaSchema.path('title').validate(function (v) {
    return !!v && v.length > 2 && v.length < 70;
});

module.exports.AreaModel = mongoose.model('Area', AreaSchema);

function getRandomColor() {
    /*
     all color
     var letters = '0123456789ABCDEF'.split('');
     var color = '#';
     for (var i = 0; i < 6; i++ ) {
     color += letters[Math.floor(Math.random() * 16)];
     }
     return color;
     */

    //dark colours
    var letters = '012345'.split('');
    var color = '#';
    color += letters[Math.round(Math.random() * 5)];
    letters = '0123456789ABCDEF'.split('');
    for (var i = 0; i < 5; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function getDefaultTitleName() {
    return 'Area ' + moment(this.created, "MMMM Do");
}