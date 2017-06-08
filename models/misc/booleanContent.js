var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _ = require('lodash');


// define the schema for our BooleanContent model
var BooleanContentSchema = mongoose.Schema({
    label: {type: String, required: true},
    value: {type: Boolean},
},
    {
        timestamps: true
    });

// create the model for BooleanContents and expose it to our app
module.exports = mongoose.model('BooleanContent', BooleanContentSchema);
