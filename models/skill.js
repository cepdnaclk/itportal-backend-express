var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');


// define the schema for our Skill model
var SkillSchema = mongoose.Schema({
    type: {
        type: String,
        enum: [
            'DEVELOPMENTENVIRONMENT',
            'LANGUAGES',
            'FRAMEWORKS',
            'SOFTWARE',
            'HARDWARE',
            'THEORETICALKNOWLEDGE',
            'SOFTSKILLS',
        ],
    },
    name: { type: String, unique: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    staff: [{ type: Schema.Types.ObjectId, ref: 'Staff' }],
    oragnizationRep: [{ type: Schema.Types.ObjectId, ref: 'OrganizationRep' }],
},
    {
        timestamps: true
    });

// create the model for Skills and expose it to our app
module.exports = mongoose.model('Skill', SkillSchema);
