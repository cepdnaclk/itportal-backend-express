var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var ObjectId = mongoose.Types.ObjectId;
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
    interests: [{ type: Schema.Types.ObjectId, ref: 'Interest' }],
},
    {
        timestamps: true
    });


StudentSchema.statics.addInterest = function(_user_id, _interest_id) {
    this.findOne({StudentDetails: new ObjectId(_user_id)}, function(err, student){
        if(err){
            console.log(err);
            return;
        }

        if(student){
            student.interests.push(_interest_id);
            student.save();
        } else {
            console.log('failed to add interest', _interest_id , 'to student', _user_id)
            return;
        }
    })
};


// create the model for Students and expose it to our app
module.exports = mongoose.model('Student', StudentSchema);
