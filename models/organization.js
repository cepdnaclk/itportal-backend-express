const CompanyRep = require('../models/organizationRep');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');


// define the schema for our Organization model
var OrganizationSchema = mongoose.Schema({
    name: { type: String, required: true },
    organizationRepEmails: [String],
    photo: { type: String},
    description: { type: String },
},
    {
        timestamps: true
    });

// add author email on save..
OrganizationSchema.post('save', function(doc) {
    console.log('%s has been saved for %s :: %s', doc._id, doc.organizationRepEmails[0]);


    CompanyRep.findOne({
        email: doc.organizationRepEmails[0]
    }, function(err, companyRep) {
        if (err) {
            console.log('something went wrong:', err)
            return;
        }
        if(!companyRep){
            console.log('companyRep not found:', companyRep)
            return;
        }
        
        companyRep.company = doc._id;
        companyRep.save(function(err) {
            if (err) console.log(err);
        });
    });

})

// create the model for Organizations and expose it to our app
module.exports = mongoose.model('Organization', OrganizationSchema);
