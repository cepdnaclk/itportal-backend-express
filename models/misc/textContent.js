var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _ = require('lodash');


// define the schema for our TextContent model
var TextContentSchema = mongoose.Schema({
    label: {type: String, required: true},
    value: {type: String},
},
    {
        timestamps: true
    });

// create the model for TextContents and expose it to our app
module.exports = mongoose.model('TextContent', TextContentSchema);
