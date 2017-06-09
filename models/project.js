const Student = require('../models/student');
const CompanyRep = require('../models/organizationRep');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');

// define the schema for our Project model
var ProjectSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['ACADEMIC', 'INDUSTRIAL', 'INDIVIDUAL', 'FREELANCE'],
        default: 'ACADEMIC'
    },
    title: {type: String},
    description: {type: String},

    dateStarted: { type: Date},
    dateEnded: {type: Date},

    skills: [{type: Schema.Types.ObjectId, ref: 'Skill'}],

    members: [{ type: Schema.Types.ObjectId,ref: 'Student'}],
    leaders: [{type: Schema.Types.ObjectId,ref: 'Student'}],
    mentors: [{type: Schema.Types.ObjectId,ref: 'Staff'}],

    authorEmail: {type: String,required: true},
    authorType: {type: String,required: true},

}, {
    timestamps: true
});

ProjectSchema.post('save', function(doc) {
    console.log('%s has been saved for %s :: %s', doc._id, doc.authorEmail, doc.authorType);
    console.log(doc.skills);

    if (doc.authorType === "student") {
        Student.findOne({
            email: doc.authorEmail
        }, function(err, student) {
            if (err) {
                console.log('something went wrong:', err)
                return;
            }
            if(!student){
                console.log('student not found:', student)
                return;
            }
            
            student.projects.push(doc._id);
            student.skills = _.concat(student.skills, doc.skills);

            student.save(function(err) {
                if (err) console.log(err);
            });
        });
    } else if (doc.authorType === "companyRep") {
        CompanyRep.findOne({
            email: doc.authorEmail
        }, function(err, companyRep) {
            if (err) {
                console.log('something went wrong:', err)
                return;
            }
            if(!companyRep){
                console.log('companyRep not found:', companyRep)
                return;
            }
            
            companyRep.projects.push(doc._id);
            companyRep.save(function(err) {
                if (err) console.log(err);
            });
        });
    }
})

// create the model for Projects and expose it to our app
module.exports = mongoose.model('Project', ProjectSchema);