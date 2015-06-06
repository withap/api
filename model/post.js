var mongoose        = require('libs/mongoose'),
    log             = require('libs/log')(module),
    moment          = require('moment'),
    config          = require('config'),
    uniqueValidator = require('mongoose-unique-validator'),
    Schema          = mongoose.Schema,
    async           = require('async');

var populateUser = {
    'username': true,
    'nickname': true,
    'image'   : true
};

var PostSchema = new Schema({
    content  : {
        type    : String,
        required: true
    },
    loc      : {
        type       : {
            type    : String,
            required: true,
            enum    : ['Point', 'LineString', 'Polygon'],
            default : 'Point'
        },
        coordinates: []
    },
    category : {
        type   : String,
        enum   : ['News', 'Post', 'Temp'],
        default: 'Post'
    },
    creator  : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    media    : {
        type    : Boolean,
        required: true,
        default : false
    },
    image    : {
        type   : String,
        default: ''
    },
    createdAt: {
        type   : Date,
        default: Date.now()
    }
});
PostSchema.index({loc: '2dsphere'});
// validation
PostSchema.plugin(uniqueValidator);

PostSchema.path('content').validate(function (v) {
    return !!v && v.length > 5 && v.length < 70;
});

PostSchema.virtual('createdAtWords').get(function () {
    return moment(this.created).fromNow();
});

/*PostSchema.pre("validate",function(next, done) {
 var errors = [];
 var Post = this;
 //username
 var ContentV = {
 field: 'content',
 errors: []
 };
 console.log(Post.content)
 if(!(Post.content && Post.content.length > 3 && password.length < 220)){
 ContentV.errors.push("Content must be more 5 char and less 220.");
 }
 if(ContentV.errors.length){
 errors.push(ContentV);
 }

 if(errors.length){
 done(errors);
 }
 next();
 });*/

PostSchema.statics.getByLocate = function (lat, lng, radius, callback) {
    var radius = radius * config.get('locateProportion');
    console.log(radius);
    var Post = this;
    async.waterfall([
        function (callback) {
            Post.find({
                loc: {
                    '$near': {
                        '$maxDistance': radius,
                        '$geometry'   : {type: 'Point', coordinates: [lat, lng]}
                    }
                }
            }).populate('creator', populateUser).exec(callback);
        },
        function (posts, callback) {
            if (posts) {
                callback(null, posts);
            } else {
                callback(new Error("Not found any posts"));
            }
        }
    ], callback);
};

module.exports.PostModel = mongoose.model('Post', PostSchema);