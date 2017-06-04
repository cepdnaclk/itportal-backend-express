const Students = require('../../models/student');
const Organizations = require('../../models/organization');
const OrganizationRep = require('../../models/organizationRep');

const _ = require('lodash');

const GetGPA = require('../../controllers/getResults');

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
    .populate([
        'StudentDetails',
        ])
    .exec(function( err, students){
        res.status(200).send(students);
    });

});
router.get('/profile/student/:id', function(req, res){

    let _id = req.params.id;

    Students.findById(_id)
    .populate([
        'StudentDetails',
        // 'coursesFollowed',
        // 'skills',
        'projects',
        'competitions',
        'awards',
        'cocurriculars',
        'extracurriculars',
        'interests',
        ])
    .exec(function( err, student){
        GetGPA.getStudentResults(student.registrationNumber, function(results){
            res.status(200).send({'student': student, 'academics': results});
        });
    });

});

router.get('/profile/organizationRepresentative/:id', function(req, res){

    let _id = req.params.id;

    OrganizationRep.findById(_id)
    .populate([
        'OrganizationRepDetails',
        // 'skills',
        'projects',
        'awards',
        'interests',
        'company',
    ])
    .exec(function( err, organizationRep){
        res.status(200).send(organizationRep);
    });

});

router.get('/all/organizations', function(req, res){

    Organizations.find({}, function( err, companies){
        res.status(200).send(companies);
    })    
});

}
module.exports = api;