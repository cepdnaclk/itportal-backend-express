var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');

// define the schema for our LoggingUserActivity model
var CompanyPreferenceSchema = mongoose.Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User' },
    preferences: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
}, {
    timestamps: true
});

// create the model for LoggingUserActivitys and expose it to our app
module.exports = mongoose.model('CompanyPreference', CompanyPreferenceSchema);