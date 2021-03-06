const Students = require('../../models/student');
const Organizations = require('../../models/organization');
const OrganizationRep = require('../../models/organizationRep');
const Offers = require('../../models/interviews/offers');

const DateContent = require('../../models/misc/dateContent');
const TextContent = require('../../models/misc/textContent');

const ProfileViews = require('../../models/logging/profile_views');
const ProfileViews_companyProfile = require('../../models/logging/profile_views_company');

const _ = require('lodash');

const GetGPA = require('../../controllers/getResults');

const EventEmitter = require('events');
const path = require('path');

function api(router){

/*
     .o88b.  .d88b.  db    db d8b   db d888888b .d8888.
    d8P  Y8 .8P  Y8. 88    88 888o  88 `~~88~~' 88'  YP
    8P      88    88 88    88 88V8o 88    88    `8bo.
    8b      88    88 88    88 88 V8o88    88      `Y8b.
    Y8b  d8 `8b  d8' 88b  d88 88  V888    88    db   8D
     `Y88P'  `Y88P'  ~Y8888P' VP   V8P    YP    `8888Y'


*/

router.get('/home/getData', function(req, res){

    let _students_count = 0;
    let _companies_count = 0;
    let _students_selected_count = 0;

    let _training_start_date = null;
    let _home_content = null;
    let _home_footer_content = null;

    let _eventEmitter = new EventEmitter();

    let _items = {
        students: false,
        organizations: false,
        students_selected_count: false,
        training_start_date: false,
        home_content: false,
        home_footer_content: false,
    }

    _eventEmitter.on('done', function(item){
        _items[item] = true;

        let _finished = true;

        _.forEach(_items, function(o,i){
            if(!o) { // if at least is one is not finished
                _finished = false;
            }
        })

        if(_finished){

            res.status(200).send({
                content: {
                    training_start_date: (_training_start_date ? _training_start_date.value : null),
                    home_content: (_home_content ? _home_content.value : null),
                    home_footer_content: (_home_footer_content ? _home_footer_content.value : null),
                },
                count: {
                    students: _students_count,
                    companies: _companies_count,
                    students_selected: _students_selected_count,
                }
            });

        }
    });

    Students.count({}, function( err, count){
        if(count){
            _students_count = count;
        }
        _eventEmitter.emit('done', 'students');
    })


    Organizations.count({}, function( err, count){
        if(count){
            _companies_count = count;
        }
        _eventEmitter.emit('done', 'organizations');
    })

    Offers.count({accepted: true}, function( err, count){
        if(count){
            _students_selected_count = count;
        }
        _eventEmitter.emit('done', 'students_selected_count');
    })
    
    DateContent.findOne({label: 'training_start_date'}, function( err, date){
        if(date){
            _training_start_date = date;
        }
        _eventEmitter.emit('done', 'training_start_date');
    })

    TextContent.findOne({label: 'home_content'}, function( err, content){
        if(content){
            _home_content = content;
        }
        _eventEmitter.emit('done', 'home_content');
    })
    TextContent.findOne({label: 'home_footer_content'}, function( err, content){
        if(content){
            _home_footer_content = content;
        }
        _eventEmitter.emit('done', 'home_footer_content');
    })
    
});
router.get('/home/gettingStarted', function(req, res){

    TextContent.findOne({label: 'getting_started'}).
    exec(function(err, data){
        if(err){
            res.status(404).send('getting_started_content_not_found');
            return;
        }
        if(!data){
            res.status(400).send('getting_started_content_not_found');
            return;
        }
        res.status(200).send(data.value);
        return;
    })

    
});


/*
     .d8b.  db      db
    d8' `8b 88      88
    88ooo88 88      88
    88~~~88 88      88
    88   88 88booo. 88booo.
    YP   YP Y88888P Y88888P


*/

router.get('/all/students', function(req, res){

    Students.find({})
    .populate([
        'StudentDetails',
        ])
    .exec(function( err, students){
        res.status(200).send(students);
    });

});

router.get('/all/organizations', function(req, res){

    Organizations.find({}, function( err, companies){
        res.status(200).send(companies);
    })    
});

/*
    d8888b. d8888b.  .d88b.  d88888b d888888b db      d88888b .d8888.
    88  `8D 88  `8D .8P  Y8. 88'       `88'   88      88'     88'  YP
    88oodD' 88oobY' 88    88 88ooo      88    88      88ooooo `8bo.
    88~~~   88`8b   88    88 88~~~      88    88      88~~~~~   `Y8b.
    88      88 `88. `8b  d8' 88        .88.   88booo. 88.     db   8D
    88      88   YD  `Y88P'  YP      Y888888P Y88888P Y88888P `8888Y'


*/

router.get('/profile/student/:id', function(req, res){

    let _id = req.params.id;


    Students.findById(_id)
    .populate([
        'StudentDetails',
        // 'coursesFollowed',
        // 'skills',
        'competitions',
        'awards',
        'cocurriculars',
        'extracurriculars',
        'interests',
        ])
    .populate({path:'projects', populate: {path: 'skills'}})
    .exec(function( err, student){
        if(err){
            console.log(err);
            res.status(400).send('failed to find the student');
            return;
        }
        if(student){
            GetGPA.getStudentResults(student.registrationNumber, function(results){

                let _newProfileView = new ProfileViews();
                if(req.user) {
                    _newProfileView.viewed_by = req.user._id;
                }
                _newProfileView.viewed_profile = student.StudentDetails._id;

                if(!req.user){
                    _newProfileView.save();
                } else if(req.user._id != student.StudentDetails._id){
                    _newProfileView.save();
                }

                res.status(200).send({'student': student, 'academics': results});
            });
            
        } else {
            res.status(400).send('student not found');
            return;   
        }
    });

});

router.get('/profile/organizationRepresentative/:id', function(req, res){

    let _id = req.params.id;

    OrganizationRep.findById(_id)
    .populate([
        'OrganizationRepDetails',
        // 'skills',
        'awards',
        'interests',
        'company',
    ])
    .populate({path:'projects', populate: {path: 'skills'}})
    .exec(function( err, organizationRep){

        let _newProfileView = new ProfileViews();
        if(req.user) {
            _newProfileView.viewed_by = req.user._id;
        }
        _newProfileView.viewed_profile = organizationRep.OrganizationRepDetails._id;

        if(!req.user){
            _newProfileView.save();
        } else if(req.user._id != organizationRep.OrganizationRepDetails._id){
            _newProfileView.save();
        }


        res.status(200).send(organizationRep);
    });

});


router.get('/profile/organization/:id', function(req, res){

    let _id = req.params.id;

    Organizations.findById(_id)
    .exec(function( err, organization){

        let _newProfileView = new ProfileViews_companyProfile();
        if(req.user) {
            _newProfileView.viewed_by = req.user._id;
        }
        _newProfileView.viewed_company = organization._id;
        _newProfileView.save();

        res.status(200).send(organization);
    });

});

router.get('/all/student/cv/:file_name', function(req, res){

    let _file_name= req.params.file_name;
    let _index = _file_name.indexOf('-user-');

    let _extension = _file_name.substr(_file_name.indexOf('.'));
    let _student_id = _file_name.substr(0,_file_name.indexOf('-user-'));

    if(!_file_name || !_student_id || !_extension || (_index != 24)){
        res.status(400).send('Bad request...' + _file_name + ' ::: ' + _student_id + ' ::: index:' + _index);
        return;
    }

    Students.findById(_student_id)
    .populate('StudentDetails')
    .exec(function(err, student){
        if(err){
            console.error(err);
            res.send(400);
            return;
        }
        if(student){
            res.download(path.resolve('uploads/'+_file_name), (student.StudentDetails.name.replace(/\./g,'').replace(/\s/g, '_') + _extension));
            return;
        } else {
            console.log('no student record found');
            res.send(400);
            return;
        }
    })


});

router.post('/profile/organizationReps/organization', function(req, res){

    let _reps = req.body.reps;

    OrganizationRep.find({email: {'$in': _reps}})
    .populate(['OrganizationRepDetails'])
    .exec(function( err, reps){
        console.log('[REPS] count :', reps)
        res.status(200).send(reps);
    });

});


}
module.exports = api;