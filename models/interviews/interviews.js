var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our Interview model
var InterviewSchema = mongoose.Schema({

    student: { type: Schema.Types.ObjectId, ref: 'User' },
    company: { type: Schema.Types.ObjectId, ref: 'Organization' },

}, {
    timestamps: true
});

// create the model for Interviews and expose it to our app
module.exports = mongoose.model('Interview', InterviewSchema);