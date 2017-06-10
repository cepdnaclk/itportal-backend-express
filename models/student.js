var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var ObjectId = mongoose.Types.ObjectId;
var _ = require('lodash');

const TaskStudent = require('../models/logging/task_student');

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

StudentSchema.post('save', function(doc){
    // console.log('[POST-SAVE]', doc);

    if(!doc){
        console.log('[USER][POST-SAVE-MODEL] student result not saved')
        return;
    }
    console.log('[USER][POST-SAVE-MODEL] student result saved')

    let _data = {
        student: new ObjectId(doc._id),

        add_registrationNumber: ((doc.registrationNumber != 'E/XX/XXX') ? true : false),
        add_projects: (doc.projects.length>0? true : false),
        add_skills: (doc.skills.length>0? true : false),
        add_competitions: (doc.competitions.length>0 ? true : false),
        add_awards: (doc.awards.length>0 ? true : false),
        add_cocurriculars: (doc.cocurriculars.length>0 ? true : false),
        add_extracurriculars: (doc.extracurriculars.length>0 ? true : false),
        add_interests: (doc.interests.length>0 ? true : false),
    };

    TaskStudent.findOneAndUpdate({student: new ObjectId(doc._id)}, _data, {upsert:true}, function(err, result){
        if (err) console.error(err);
    });
})
// create the model for Students and expose it to our app
module.exports = mongoose.model('Student', StudentSchema);
