var config            = require('config'),
    cloudinary        = require('cloudinary'),
    log               = require('libs/log')(module),
    cloudinary_config = config.get('cloudinary');

cloudinary.config(cloudinary_config);

CloudinaryApi = {
    uploadToCloudinary: function (image, callback) {
        cloudinary.uploader.upload(image.url, function (cloudinary) {
            var urlParams = (image.avatar != undefined && image.avatar ) ? '/c_fill,g_face,h_200,r_100,w_200' : '';
            var file = {
                cloudinaryPublicId: cloudinary.public_id,
                cloudinaryVersion : cloudinary.version,
                url               : 'http://res.cloudinary.com/withap/image/upload' +
                urlParams +
                '/v' +
                cloudinary.version +
                '/' +
                cloudinary.public_id +
                image.extension
            };

            callback(null, file);

        });
    }
};


module.exports = CloudinaryApi;