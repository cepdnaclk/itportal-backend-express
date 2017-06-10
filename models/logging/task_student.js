var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');

// define the schema for our TaskStudent model
var TaskStudentSchema = mongoose.Schema({

    student: { type: Schema.Types.ObjectId, ref: 'Student' },

    add_registrationNumber: {type:Boolean, default: false},
    
    add_projects: {type:Boolean, default: false},
    add_skills: {type:Boolean, default: false},
    add_competitions: {type:Boolean, default: false},
    add_awards: {type:Boolean, default: false},
    add_cocurriculars: {type:Boolean, default: false},
    add_extracurriculars: {type:Boolean, default: false},
    add_interests: {type:Boolean, default: false},
   
    view_company: {type:Boolean, default: false},
    view_company_rep: {type:Boolean, default: false},

    set_company_preference: {type:Boolean, default: false},
    set_interview_state: {type:Boolean, default: false},
    set_offer_state: {type:Boolean, default: false},

}, {
    timestamps: true
});

// create the model for TaskStudents and expose it to our app
module.exports = mongoose.model('TaskStudent', TaskStudentSchema);