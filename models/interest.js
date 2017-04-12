var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');


// define the schema for our Interest model
var InterestSchema = mongoose.Schema({

    name: { type: String, unique },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    staff: [{ type: Schema.Types.ObjectId, ref: 'Staff' }],
},
    {
        timestamps: true
    });

// create the model for Interests and expose it to our app
module.exports = mongoose.model('Interest', InterestSchema);
