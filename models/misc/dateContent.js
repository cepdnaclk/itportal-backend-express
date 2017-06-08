var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _ = require('lodash');


// define the schema for our DateContent model
var DateContentSchema = mongoose.Schema({
    label: {type: String, required: true},
    value: {type: Date},
},
{
    timestamps: true
});

// create the model for DateContents and expose it to our app
module.exports = mongoose.model('DateContent', DateContentSchema);
