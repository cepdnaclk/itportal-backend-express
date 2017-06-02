var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our CompanyPreference model
var CompanyPreferenceSchema = mongoose.Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User' },
    preferences: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
}, {
    timestamps: true
});

// create the model for CompanyPreferences and expose it to our app
module.exports = mongoose.model('CompanyPreference', CompanyPreferenceSchema);