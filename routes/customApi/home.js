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

router.get('/all/students', function(req, res){

    Students.find({})
    .populate(['StudentDetails'])
    .exec(function( err, students){
        res.status(200).send(students);
    });

});

router.get('/all/organizations', function(req, res){

    Organizations.find({}, function( err, companies){
        res.status(200).send(companies);
    })    
});

}
module.exports = api;