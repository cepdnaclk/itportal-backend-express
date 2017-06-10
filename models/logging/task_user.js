var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');

// define the schema for our TaskUser model
var TaskUserSchema = mongoose.Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User' },

    create_account: {type:Boolean, default: true},
    confirm_email: {type:Boolean, default: false},

    add_intro: {type:Boolean, default: false},
    add_profilepic: {type:Boolean, default: false},
    add_phone: {type:Boolean, default: false},

    add_link_linkedIn: {type:Boolean, default: false},
    add_link_github: {type:Boolean, default: false},
    add_link_stackoverflow: {type:Boolean, default: false},
    add_link_personal: {type:Boolean, default: false},
    add_link_facebook: {type:Boolean, default: false},
}, {
    timestamps: true
});

// create the model for TaskUsers and expose it to our app
module.exports = mongoose.model('TaskUser', TaskUserSchema);