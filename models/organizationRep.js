var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
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
    company: { type: Schema.Types.ObjectId, ref: 'Organization' },
},
    {
        timestamps: true
    });
OrganizationRepSchema.statics.addInterest = function(_user_id, _interest_id) {
    OrganizationRepSchema.findOne({StudentDetails: new ObjectId(_user_id)}, function(err, organization_rep){
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
// create the model for OrganizationReps and expose it to our app
module.exports = mongoose.model('OrganizationRep', OrganizationRepSchema);
