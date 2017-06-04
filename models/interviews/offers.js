var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define the schema for our Offer model
var OfferSchema = mongoose.Schema({

    student: { type: Schema.Types.ObjectId, ref: 'User' },
    company: { type: Schema.Types.ObjectId, ref: 'Organization' },
    accepted: { type: Boolean },

}, {
    timestamps: true
});

// create the model for Offers and expose it to our app
module.exports = mongoose.model('Offer', OfferSchema);