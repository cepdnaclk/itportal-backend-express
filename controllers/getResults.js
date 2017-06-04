const fs = require('fs');

const LoggingActivity = require('../models/logging/activity');

module.exports = {
	getStudentResults: function(regNumber, cb){
		if(global.grades[regNumber]){
			return cb(global.grades[regNumber]);
		}

		return cb({});
	}
}