var crypto          = require('crypto'),
    async           = require('async'),
    mongoose        = require('libs/mongoose'),
    log             = require('libs/log')(module),
    uniqueValidator = require('mongoose-unique-validator'),
    validator       = require('validator'),
    Schema          = mongoose.Schema;

var UserSchema = new Schema({
    /* username = user email */
    username      : {
        type   : String,
        unique : true,
        require: true
    },
    nickname      : {
        type: String
    },
    image         : {
        type: String
    },
    hashedPassword: {
        type    : String,
        required: true,
        //select: false
    },
    salt          : {
        type    : String,
        required: true,
        //select: false
    },
    facebookId    : {
        type: Number
    },
    googlePlusId  : {
        type: Number
    },
    twitterId     : {
        type: Number
    },
    createdAt     : {
        type   : Date,
        default: Date.now()
    }
});

UserSchema.plugin(uniqueValidator);
//
//UserSchema.path('username').validate(function (v) {
//    return !!v && v.length > 1 && v.length < 70;
//});

UserSchema.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

//User.pre('save', function(next) {
//    if (!validatePresenceOf(this.password)) {
//        next(new Error('Invalid password'));
//    } else {
//        next();
//    }
//});

UserSchema.virtual('userId')
    .get(function () {
        return this.id;
    });

UserSchema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._plainPassword
    });

UserSchema.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

/*UserSchema.pre("validate",function(next, done) {
 var errors = [];
 var User = this;
 //username
 mongoose.models["User"].findOne({username : User.username},function(err, results) {
 var UserValidate = {
 field: 'username',
 errors: []
 };
 if(err) {
 done(err);
 } else if(results) { //there was a result found, so the email address exists
 console.log(results)
 UserValidate.errors.push("This username is already exists in system.");
 }
 });
 if(!validator.isEmail(User.username)){
 UserValidate.errors.push("Username must be like email.");
 }

 if(UserValidate.errors.length){
 errors.push(UserValidate);
 }

 if(errors.length){
 done(errors);
 }
 next();
 });*/

UserSchema.statics.registration = function (user, callback) {
    var username = user.username;
    var password = user.password;
    var UserModel = this;

    async.waterfall([
        function (callback) {
            UserModel.findOne({username: username}, callback);
        },
        function (user, callback) {
            var errors = [];

            //username
            var UserValidate = {
                field : 'username',
                errors: []
            };
            if (user) {
                UserValidate.errors.push("This username is already exists in system.");
            }

            if (!validator.isEmail(username)) {
                UserValidate.errors.push("Username must be like email.");
            }
            if (UserValidate.errors.length) {
                errors.push(UserValidate);
            }
            //password
            var PasswordValidate = {
                field : 'password',
                errors: []
            };
            if (!(password && password.length > 5 && password.length < 20)) {
                PasswordValidate.errors.push("Password must be more 5 char and less 20.");
            }
            if (PasswordValidate.errors.length) {
                errors.push(PasswordValidate);
            }

            if (errors.length) {
                callback(errors);
            } else {
                var nickname = username.substring(0, username.indexOf('@'));
                var image = '/images/wr.png';
                var user = new UserModel({
                    username: username,
                    password: password,
                    nickname: nickname,
                    image   : image
                });
                user.save(function (err) {
                    if (err) return callback(err);
                    callback(null, user);
                });
            }
        }
    ], callback);
};

UserSchema.statics.authorize = function (username, password, callback) {
    var User = this;
    async.waterfall([
        function (callback) {
            User.findOne({username: username}, callback);
        },
        function (user, callback) {
            if (user) {
                if (user.checkPassword(password)) {
                    callback(null, user);
                } else {
                    callback(new Error("The Password is wrong"));
                }
            } else {
                callback(new Error("The username is wrong"));
            }
        }
    ], callback);
};

exports.UserModel = mongoose.model('User', UserSchema);