var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');


// define the schema for our Student model
var StudentSchema = mongoose.Schema({
    email: { type: String, required: true },
    StudentDetails: { type: Schema.Types.ObjectId, ref: 'User' },
    registrationNumber: { type: String, default: 'E/XX/XXX' },
    GPA: { type: Number, default: 0.0 },
    coursesFollowed: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    competitions: [{ type: Schema.Types.ObjectId, ref: 'Competition' }],
    awards: [{ type: Schema.Types.ObjectId, ref: 'Award' }],
    cocurriculars: [{ type: Schema.Types.ObjectId, ref: 'Cocurricular' }],
    extracurriculars: [{ type: Schema.Types.ObjectId, ref: 'Extracurricular' }],
    Interests: [{ type: Schema.Types.ObjectId, ref: 'Interest' }],
},
    {
        timestamps: true
    });

// create the model for Students and expose it to our app
module.exports = mongoose.model('Student', StudentSchema);
