const Students = require('../../models/student');
const Organizations = require('../../models/organization');

const _ = require('lodash');

function api(router){


router.get('/home/getCounts', function(req, res){

    let _students_count = 0;
    let _companies_count = 0;
    let _students_selected_count = 0;

    Students.count({}, function( err, count){
        _students_count = count;

        Organizations.count({}, function( err, count){
            _companies_count = count;

            res.status(200).send({
                students: _students_count,
                companies: _companies_count,
                students_selected: _students_selected_count,
            })

        })
    })

    
});

}
module.exports = api;