var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');

// define the schema for our LoggingUserActivity model
var LoggingUserActivitySchema = mongoose.Schema({

    type: {type:String},
    user: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

// create the model for LoggingUserActivitys and expose it to our app
module.exports = mongoose.model('LoggingUserActivity', LoggingUserActivitySchema);