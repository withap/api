var config            = require('config'),
    mongoose          = require('mongoose'),
    cloudinary        = require('cloudinary'),
    log               = require('libs/log')(module),
    Schema            = mongoose.Schema,
    async             = require('async'),
    cloudinary_config = config.get('cloudinary'),
    uniqueValidator   = require('mongoose-unique-validator');

cloudinary.config(cloudinary_config);

var ImageSchema = new Schema({
    url               : {
        type: String
    },
    postId            : {
        type    : String,
        required: true
    },
    category          : {
        type   : String,
        enum   : ['Avatar', 'Post'],
        default: 'Post'
    },
    cloudinaryPublicId: {
        type    : String,
        required: true
    },
    cloudinaryVersion : {
        type    : String,
        required: true
    },
    extension         : {
        type    : String,
        required: true
    },
    post              : {
        type: Schema.Types.ObjectId,
        ref : 'Post'
    },
    creator           : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    },
    createdAt         : {
        type   : Date,
        default: Date.now()
    }
});

// validation
ImageSchema.virtual('link')
    .get(function () {
        return 'http://res.cloudinary.com/withap/image/upload/' + this.cloudinaryPublicId + '/' + this.cloudinaryPublicId + '.' + this.extension;
    });

ImageSchema.virtual('file')
    .set(function (file) {
        this.file = file;
    })
    .get(function () {
        return this.file
    });

ImageSchema.plugin(uniqueValidator);

ImageSchema.statics.uploadToCloudinary = function (image, callback) {
    cloudinary.uploader.upload(image.url, function (cloudinary) {
        image.cloudinaryPublicId = cloudinary.public_id;
        image.cloudinaryVersion = cloudinary.version;
        image.url = 'http://res.cloudinary.com/withap/image/upload/v' + image.cloudinaryVersion + '/' + image.cloudinaryPublicId + image.extension;

        image.save(function (err) {
            if (!err) {
                log.info("Image UPLOADED  id: %s", image.id);
                callback(null, image);
            } else {
                if (err.name === 'ValidationError') {
                    callback({statusCode: 400, statusMessage: 'Validation error'});
                } else {
                    callback({statusCode: 500, statusMessage: 'Server error'});
                }

            }
        });
    });
};

module.exports.ImageModel = mongoose.model('Image', ImageSchema);