const fs = require('fs');

const LoggingActivity = require('../models/logging/activity');

module.exports = {
	getStudentResults: function(regNumber){
		if(global.grades[regNumber]){
			return global.grades[regNumber];
		}

		return;
	}
}