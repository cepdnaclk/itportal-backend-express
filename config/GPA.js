let _gradePoints = {
	'A+':4.0,
	'A':4.0,
	'A-':3.7,
	'B+':3.3,
	'B':3.0,
	'B-':2.7,
	'C+':2.3,
	'C':2.0,
	'C-':1.7,
	'D+':1.3,
	'D':1.0,
	'E':0.0
}

module.exports = {

	gradePoints: _gradePoints,

	getGradePoints: function(grade){
		if(this.gradePoints[grade]){
			return this.gradePoints[grade]
		}
		return 0.0;
	},
	
}