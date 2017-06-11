var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _ = require('lodash');

// define the schema for our ProfileViewCompany model
var ProfileViewCompanySchema = mongoose.Schema({
    viewed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    viewed_company: { type: Schema.Types.ObjectId, ref: 'Organization' },
}, {
    timestamps: true
});

// create the model for ProfileViewCompanys and expose it to our app
module.exports = mongoose.model('ProfileViewCompany', ProfileViewCompanySchema);