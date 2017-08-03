var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// define the schema for our CompanyPreference model
var CompanyPreferenceSchema = mongoose.Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User' },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    preference: { type: Number },

    // states
    admin_approved: {type: Boolean, default: false},
    company_viewed: {type: Boolean, default: false},
    company_interviewed: {type: Boolean, default: false},
    company_accepted: {type: Boolean, default: false},

    student_accepted: {type: Boolean},

}, {
    timestamps: true
});

// create the model for CompanyPreferences and expose it to our app
module.exports = mongoose.model('CompanyPreference', CompanyPreferenceSchema);