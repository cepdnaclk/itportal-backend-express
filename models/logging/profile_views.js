var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var _ = require('lodash');

// define the schema for our ProfileView model
var ProfileViewSchema = mongoose.Schema({
    viewed_by: { type: Schema.Types.ObjectId, ref: 'User' },
    viewed_profile: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true
});

// create the model for ProfileViews and expose it to our app
module.exports = mongoose.model('ProfileView', ProfileViewSchema);