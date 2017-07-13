var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');

// define the schema for our QueueJoinCompany model
var QueueJoinCompanySchema = mongoose.Schema({

    user_new_organization_id: {type: String},
    user_email: {type: String},

}, {
    timestamps: true
});

// create the model for QueueJoinCompany and expose it to our app
module.exports = mongoose.model('QueueJoinCompany', QueueJoinCompanySchema);