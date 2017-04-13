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

    dateStarted: {type: Date},
    dateEnded: {type: Date},

    members: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    leaders: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    mentors: [{ type: Schema.Types.ObjectId, ref: 'Staff' }],

}, {
    timestamps: true
});

// create the model for Projects and expose it to our app
module.exports = mongoose.model('Project', ProjectSchema);