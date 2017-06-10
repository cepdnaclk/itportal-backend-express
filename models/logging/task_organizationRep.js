var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');

// define the schema for our TaskOrganizationRep model
var TaskOrganizationRepSchema = mongoose.Schema({

    user: { type: Schema.Types.ObjectId, ref: 'OrganizationRep' },

    add_registraionNumber: {type:Boolean, default: false},
    add_projects: {type:Boolean, default: false},
    add_skills: {type:Boolean, default: false},
    add_awards: {type:Boolean, default: false},
    add_interests: {type:Boolean, default: false},

    changed_password: {type:Boolean, default: true},

    join_company: {type:Boolean, default: false},
    view_students: {type:Boolean, default: false},
    view_company: {type:Boolean, default: false},

    interview_view: {type:Boolean, default: false},
    interview_add: {type:Boolean, default: false},
    interview_accept_or_reject: {type:Boolean, default: false},
    
}, {
    timestamps: true
});

// create the model for TaskOrganizationReps and expose it to our app
module.exports = mongoose.model('TaskOrganizationRep', TaskOrganizationRepSchema);