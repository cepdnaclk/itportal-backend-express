const fs = require('fs');
const _ = require('lodash');


const LoggingActivity = require('../models/logging/activity');

module.exports = {
	getStudentResults: function(regNumber, cb){

		if(global.grades[regNumber]){
			return cb(global.grades[regNumber]);
		}

		return cb({});

	},
	getStudentGPA: function(regNumber){

		let _grades = global.grades[regNumber];

		let _creditHours = 0;
		let _gradePoints = 0;

		_.forEach(_grades, function(o){
			_creditHours += +o.credits;
			_gradePoints += o.credits * o.points;
		});

		let _gpa = Math.round(100 * (_gradePoints/_creditHours) )/100;

		// console.log(_gpa);
		return _gpa;
	}
}