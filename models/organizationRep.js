var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');


// define the schema for our OrganizationRep model
var OrganizationRepSchema = mongoose.Schema({
    email: { type: String, required: true },
    OrganizationRepDetails: { type: Schema.Types.ObjectId, ref: 'User' },
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    awards: [{ type: Schema.Types.ObjectId, ref: 'Award' }],
    Interests: [{ type: Schema.Types.ObjectId, ref: 'Interest' }],
},
    {
        timestamps: true
    });

// create the model for OrganizationReps and expose it to our app
module.exports = mongoose.model('OrganizationRep', OrganizationRepSchema);
