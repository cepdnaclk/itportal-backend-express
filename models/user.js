var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');


var UserSchema = mongoose.Schema({

    email: {type: String, unique: true},
    password: {type: String},
    name: String,
    photo: String,

    role: {
        type: [String],
        enum: ['STUDENT', 'ADMIN', 'COMPANY', 'STAFF'],
        default: 'STUDENT'
    },

    title: String,
    tagline: String,

    phone: { type: 'string', defaultsTo: '000-000-0000' },
    birthDay: { type: 'date' },

    linksFacebook: {type: 'string'},
    linksLinkedin: {type: 'string'},
    linksStackoverflow: {type: 'string'},
    linksGithub: {type: 'string'},
    linksPortfolio: {type: 'string'},

    emailConfirmed: {
        type: Boolean,
        default: false,
    },
    emailConfirmationHash: {type: String},

}, {
    timestamps: true
});


// methods ======================
// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};


// generating a confirmation hash
UserSchema.methods.generateConfirmationHash = function(shortid) {
    return bcrypt.hashSync(shortid, bcrypt.genSaltSync(8), null);
};
// checking if confirmation hash is valid
UserSchema.methods.validConfirmationHash = function(shortid) {
    return bcrypt.compareSync(shortid, this.emailConfirmationHash);
};

// // get information for jwt
// UserSchema.methods.toJSON = function() {
//     return _.omit(this, ['password', 'emailConfirmationHash']);
// };

// create the model for Users and expose it to our app
module.exports = mongoose.model('User', UserSchema);