var mongoose = require('mongoose');

// define the schema for our listing model
var listingSchema = mongoose.Schema({

    user_email: {type: String, required: true},
    phone: {type: String, required: true},

    address:   {type: Object, required: true},
    location:   {type: String, required: true},
    location_long:   {type: String, required: true},
    location_lat: {type: Number, require: true},
    location_lon: {type: Number, require: true},

    price:      {type: Number, required: true},
    image_url:  {type: String},
    image_id:  {type: String},

    
},
{
  timestamps: true
});

// methods ======================
// listingSchema.methods.doSomething = function(args) {
//     return args;
// };

// create the model for listings and expose it to our app
module.exports = mongoose.model('listing', listingSchema);