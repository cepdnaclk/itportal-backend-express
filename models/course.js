var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var _ = require('lodash');


// define the schema for our Course model
var CourseSchema = mongoose.Schema({

    course_id: {type: String, unique: true},
    name: {type: String},
    students: [{type: Schema.Types.ObjectId, ref: 'Student'}],
    staff: [{type: Schema.Types.ObjectId, ref: 'Staff'}],
},
    {
        timestamps: true
    });

// create the model for Courses and expose it to our app
module.exports = mongoose.model('Course', CourseSchema);
