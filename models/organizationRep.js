var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');

const TaskRep = require('../models/logging/task_organizationRep');


// define the schema for our OrganizationRep model
var OrganizationRepSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    OrganizationRepDetails: { type: Schema.Types.ObjectId, ref: 'User' },
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    awards: [{ type: Schema.Types.ObjectId, ref: 'Award' }],
    interests: [{ type: Schema.Types.ObjectId, ref: 'Interest' }],
    company: { type: Schema.Types.ObjectId, ref: 'Organization' },
},
    {
        timestamps: true
    });
OrganizationRepSchema.statics.addInterest = function(_user_id, _interest_id) {
    this.findOne({OrganizationRepDetails: new ObjectId(_user_id)}, function(err, organization_rep){
        if(err){
            console.log(err);
            return;
        }

        if(organization_rep){
            organization_rep.interests.push(_interest_id);
            organization_rep.save();
        } else {
            console.log('failed to add interest', _interest_id , 'to organization_rep', _user_id)
            return;
        }
    })
};

OrganizationRepSchema.post('save', function(doc){
    // console.log('[POST-SAVE]', doc);

    if(!doc){
        console.log('[USER][POST-SAVE-MODEL] organizationRep result not saved')
        return;
    }
    console.log('[USER][POST-SAVE-MODEL] organizationRep result saved')

    let _data = {
        organizationRep: new ObjectId(doc._id),

        add_projects: (doc.projects.length>0? true : false),
        add_skills: (doc.skills.length>0? true : false),
        add_awards: (doc.awards.length>0 ? true : false),
        add_interests: (doc.interests.length>0 ? true : false),
    };

    TaskRep.findOneAndUpdate({organizationRep: new ObjectId(doc._id)}, _data, {upsert:true}, function(err, result){
        if (err) console.error(err);
    });
})
// create the model for OrganizationReps and expose it to our app
module.exports = mongoose.model('OrganizationRep', OrganizationRepSchema);
