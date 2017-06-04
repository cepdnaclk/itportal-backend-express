const http = require('https');
const fs = require('fs');
const settings = require('../config');
const gpa = require('../config/GPA');

const Student = require('../models/student');

const LoggingActivity = require('../models/logging/activity');

const GetGPA = require('./getResults');

const _ = require('lodash');

let _pending_operations = 0;

let getFiles = function(url, dest, batch, cb) {
	_pending_operations++;
    const file = fs.createWriteStream(dest);
    const request = http.get(url, function(response) {
        response.pipe(file);

        file.on('finish', function() {
            file.close(function(){

	            fs.readFile(dest, 'utf8' ,function(err, data) {
	                if (err) {
	                    return cb(err.message, batch)
	                }
	                saveBatchJSON_inMemory(batch, data, cb);

	            });
            	
            }); // close() is async, call cb after close completes.


        });
    }).on('error', function(err) { // Handle errors

        // fs.unlink(dest); // Delete the file async. (But we don't check the result)

        let _json_file_dest = __dirname + '/../private/' + settings.location_results + 'marks_e' + batch + '.json';
        fs.readFile(_json_file_dest, 'utf8' ,function(err, data) {
            if (err) {
                // return cb(err.message, batch)
                console.log('[LOG][updateResults]', 'rollback to json failed',batch);
                return;
            }
            return cb('rollback to previous .json', batch)
        });

        if (cb) cb(err.message, batch);
    });
};

let saveBatchJSON_inMemory = function(batch, data, cb){


	if(!data){
        return cb('invalid data in gpa score files', batch)
	}

	let _raw_lines = data.split('\n');
	let _lines = [];

	_.forEach(_raw_lines, function(o,i){
		o = o.replace('\r','');
		o = o.split(',');
		_lines.push(o)
	})

	// console.log(_lines)

	let _fields = _lines[0].slice(1);
	let _credits = _lines[1].slice(1);

	// console.log(_fields);
	// console.log(_credits);

	let _grades = _lines.splice(2);
	// console.log(_grades);

	let _gradesJSON = {};

	_.forEach(_grades, function(o){
		let regNumber = o[0];
		if(!regNumber){
			return;
		}
		_gradesJSON[regNumber] = {}

		let _grade_scores = o.slice(1)
		_.forEach(_grade_scores, function(score, i){

			let _field_name = _fields[i];
			let _field_credits = _credits[i];

			_gradesJSON[regNumber][_field_name] = {'field': _field_name,  'grade': score, 'credits': _field_credits, 'points': gpa.getGradePoints(score)}

		})

	})

	if(!global.grades) global.grades = {};
	global.grades = _.assign(global.grades, _gradesJSON);
	cb(null, batch);

	fs.writeFile(__dirname + '/../private/' + settings.location_results + 'marks_e' + batch + '.json', JSON.stringify(_gradesJSON), 'utf8', function(){
		console.log('[LOG][updateResults]', 'json files written: batch',batch);
	});


}


let logUpdates = function(err, batch) {

    if (err) {
        console.error('[LOG][updateResults]', err);
        console.error('[LOG][updateResults]', 'trying for pre saved json files...');

		let _json_file_dest = __dirname + '/../private/' + settings.location_results + 'marks_e' + batch + '.json';
		fs.readFile(_json_file_dest, 'utf8', function(err, data){
			if (err){
		        console.error('[LOG][updateResults]', err);
		        return;
			}

			if(!global.grades) global.grades = {};
			global.grades = _.assign(global.grades, JSON.parse(data));

		});

        console.error('[LOG][updateResults]', 'trying for pre saved json files...DONE');

        let logging_auth = new LoggingActivity({
            type: 'server_updateResults_failed',
            payload: batch
        });
        logging_auth.save();


	    _pending_operations--;
		if(_pending_operations == 0) checkForProfileUpdates();
        return;
        
    }


    console.log('[LOG][updateResults] trying batch', batch);

    let logging_auth = new LoggingActivity({
        type: 'server_updateResults_success',
        payload: batch
    });
    logging_auth.save();

    _pending_operations--;
	if(_pending_operations == 0) checkForProfileUpdates();
}


let checkForProfileUpdates = function(){
	Student.find({registrationNumber: {$ne: 'E/XX/XXX'}})
	.exec(function(err, students){
		if(err){
			console.error(err);
			return;
		}
		if(students.length>0){

			_.forEach(students, function(o){

				let _n_gpa = GetGPA.getStudentGPA(o.registrationNumber);

				if(!_.isEqual(o.GPA, _n_gpa)){
					console.log('[LOG][checkForProfileUpdates]', o.GPA, _n_gpa);
					o.GPA = _n_gpa;
					o.save(function(err, student){
						if(err){
							console.error(err);
							return;
						}

						if(student){
							console.log('[LOG][checkForProfileUpdates] student GPA updated', student._id);
						} else {
							console.log('[LOG][checkForProfileUpdates] student GPA update failed', student._id);							
						}


					});
				}

			})

		} else {
			console.log('[LOG][checkForProfileUpdates] no students to update')
		}
	})
}




module.exports = function() {

    console.log('[LOG][updateResults]', 'starting schedule for updates');

    let logging_auth = new LoggingActivity({
        type: 'server_updateResults_start',
        payload: new Date()
    });
    logging_auth.save();

    // TODO add cron job
    getFiles('https://results.ce.pdn.ac.lk/E10GPA/marks.csv', __dirname + '/../private/' + settings.location_results + 'marks_e10.csv', 10, logUpdates)
    getFiles('https://results.ce.pdn.ac.lk/E11GPA/marks.csv', __dirname + '/../private/' + settings.location_results + 'marks_e11.csv', 11, logUpdates)
    getFiles('https://results.ce.pdn.ac.lk/E12GPA/marks.csv', __dirname + '/../private/' + settings.location_results + 'marks_e12.csv', 12, logUpdates)
    getFiles('https://results.ce.pdn.ac.lk/E13GPA/marks.csv', __dirname + '/../private/' + settings.location_results + 'marks_e13.csv', 13, logUpdates)
    getFiles('https://results.ce.pdn.ac.lk/E14GPA/marks.csv', __dirname + '/../private/' + settings.location_results + 'marks_e14.csv', 14, logUpdates)
	
}