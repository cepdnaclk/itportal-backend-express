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

}, {
    timestamps: true
});

// create the model for Competitions and expose it to our app
module.exports = mongoose.model('Competition', CompetitionSchema);