const Student = require('../models/student');
const CompanyRep = require('../models/organizationRep');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');

// define the schema for our Competition model
var CompetitionSchema = mongoose.Schema({
    type: {
        type: String,
        enum: ['HACKATHON', 'COMPETITIVEPROGRAMMING'],
    },
    title: {type: String},
    description: {type: String},

    dateStarted: {type: Date},
    dateEnded: {type: Date},

    members: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    leaders: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    mentors: [{ type: Schema.Types.ObjectId, ref: 'Staff' }],



    authorEmail: {type: String, required: true},
    authorType: {type: String, required: true},

}, {
    timestamps: true
});

CompetitionSchema.post('save', function(doc) {
    console.log('%s has been saved for %s :: %s', doc._id, doc.authorEmail, doc.authorType);

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
            
            student.competitions.push(doc._id);
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
            
            companyRep.competitions.push(doc._id);
            companyRep.save(function(err) {
                if (err) console.log(err);
            });
        });
    }
})

// create the model for Competitions and expose it to our app
module.exports = mongoose.model('Competition', CompetitionSchema);