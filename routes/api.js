const express = require('express');
const router = express.Router();

const studentModel = require('../models/student');
const userModel = require('../models/user');
const projectModel = require('../models/project');
const organizationModel = require('../models/organization');
const organizationRepModel = require('../models/organizationRep');
const competitionModel = require('../models/competition');
const awardModel = require('../models/award');
const cocurricularModel = require('../models/cocurricular');
const extracurricularModel = require('../models/extracurricular');
const interestModel = require('../models/interest');
const skillModel = require('../models/skill');

const queue_joinCompany = require('../models/queue/joinCompany');

const TaskUser = require('../models/logging/task_user');
const TaskStudent = require('../models/logging/task_student');
const TaskRep = require('../models/logging/task_organizationRep');

const ObjectId = require('mongoose').Types.ObjectId; 

const LoggingActivity = require('../models/logging/activity');

const restify = require('express-restify-mongoose');

const jwt = require('jsonwebtoken');
const config = require('../config');

const mailer = require('../controllers/email');

const mime = require('mime');
const multer = require('multer')

const _ = require('lodash');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, req.body.email + '-user-' + Date.now() + '.' + mime.extension(file.mimetype))
    }
})
const upload = multer({
    storage: storage
})
 
const Jimp = require('jimp');



router.use(addReqUserIfLoggedIn);
const homeAPI = require('./customApi/home')(router);
const trainedAPI = require('./customApi/trained')(router);


router.use(isLoggedIn);

/*
     .o88b. db    db .d8888. d888888b  .d88b.  .88b  d88.
    d8P  Y8 88    88 88'  YP `~~88~~' .8P  Y8. 88'YbdP`88
    8P      88    88 `8bo.      88    88    88 88  88  88
    8b      88    88   `Y8b.    88    88    88 88  88  88
    Y8b  d8 88b  d88 db   8D    88    `8b  d8' 88  88  88
     `Y88P' ~Y8888P' `8888Y'    YP     `Y88P'  YP  YP  YP


*/

const studentApi = require('./customApi/student')(router);
const adminAPI = require('./customApi/admin')(router);
const companyAPI = require('./customApi/company')(router);
const profileAPI = require('./customApi/profile')(router);
const userAPI = require('./customApi/user')(router);

/* show welcome message */
router.get('/', function(req, res, next) {

    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_activity = new LoggingActivity({type: 'api_bare_route', user: _user._id});
    logging_activity.save();

    res.json({
        message: 'welcome to secured api!'
    });
});

/*
    d888888b .88b  d88.  .d8b.   d888b  d88888b .d8888.
      `88'   88'YbdP`88 d8' `8b 88' Y8b 88'     88'  YP
       88    88  88  88 88ooo88 88      88ooooo `8bo.
       88    88  88  88 88~~~88 88  ooo 88~~~~~   `Y8b.
      .88.   88  88  88 88   88 88. ~8~ 88.     db   8D
    Y888888P YP  YP  YP YP   YP  Y888P  Y88888P `8888Y'


*/

router.put('/photo/user', upload.single('photo'), function(req, res, next) {
    // console.log(req);
    let _file_name = req.file.filename;
    let _file = req.file.path;


    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_activity = new LoggingActivity({type: 'api_photo_user', user: _user._id});
    logging_activity.save();

    // console.log('public/photo/user/large-' + _file_name);
    Jimp.read(_file).
    then(function(img) {
        img.cover(256,256)
            .quality(90)
            .write('public/photo/user/large-' + _file_name);
        img.cover(64,64)
            .quality(90)
            .write('public/photo/user/small-' + _file_name);


        userModel.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                res.status(400).send({
                    flashMessage: 'Something went wrong in updating your account.'
                });
                return;
            }
            if (user) {

                user.photo = _file_name;
                user.save(function(err, newuser) {
                    if (!err) {
                        req.user = newuser;

                        res.status(200).send({
                            user: newuser,
                            flashMessage: 'Photos uploaded successfully'
                        });
                    }
                })

            }


        });


    }).catch(function(err) {
        console.log(err)
        res.status(500).send({
            'flashMessage': 'Failed to resize images'
        });
    });
})

router.put('/photo/organization', upload.single('photo'), function(req, res, next) {

    let _organizationId = req.body.email;
    let _file_name = req.file.filename;
    let _file = req.file.path;



    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_activity = new LoggingActivity({type: 'api_photo_organization', user: _user._id});
    logging_activity.save();


    // console.log('public/photo/organization/large-' + _file_name);
    Jimp.read(_file).
    then(function(img) {
        img.cover(256,256)
            .quality(90)
            .write('public/photo/organization/large-' + _file_name);
        img.cover(64,64)
            .quality(90)
            .write('public/photo/organization/small-' + _file_name);

        organizationModel.findById(_organizationId, function(err, organization) {
            if (err) {
                res.status(400).send({
                    flashMessage: 'Something went wrong in updating your account.'
                });
                return;
            }
            if (organization) {

                organization.photo = _file_name;
                organization.save(function(err, newOrganization) {
                    if (!err) {
                        req.organization = newOrganization;
 
                        res.status(200).send({
                            organization: newOrganization,
                            flashMessage: 'Photo uploaded successfully'
                        });
                    }
                })

            }


        });


    }).catch(function(err) {
        console.log(err)
        res.status(500).send({
            'flashMessage': 'Failed to resize images'
        });
    });
})
router.put('/resume/student', upload.single('resume'), function(req, res, next) {

    let _student_id = req.body.student_id;
    let _file_name = req.file.filename;
    let _file = req.file.path;

    console.log('/resume/student', _student_id, _file_name, _file);

    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_activity = new LoggingActivity({type: 'api_resume_student', user: _user._id});
    logging_activity.save();


    // console.log('public/resume/student/' + _file_name);

    studentModel.findById(_student_id, function(err, student) {
        if (err) {
            res.status(400).send({
                flashMessage: 'Something went wrong in updating your account.'
            });
            return;
        }
        if (student) {

            student.resume = _file_name;
            student.save(function(err, newstudent) {
                if (!err) {
                    req.student = newstudent;

                    res.status(200).send({
                        student: newstudent,
                        flashMessage: 'Resume uploaded successfully'
                    });
                }
            })

        } else {
            res.status(400).send('Failed to find the student');
            return;
        }


    });
})

// APIs
/*
    d8888b. d88888b .d8888. d888888b d888888b d88888b db    db
    88  `8D 88'     88'  YP `~~88~~'   `88'   88'     `8b  d8'
    88oobY' 88ooooo `8bo.      88       88    88ooo    `8bd8'
    88`8b   88~~~~~   `Y8b.    88       88    88~~~      88
    88 `88. 88.     db   8D    88      .88.   88         88
    88   YD Y88888P `8888Y'    YP    Y888888P YP         YP

*/

restify.serve(router, studentModel, {

    postUpdate: function (req, res, next) {
        const result = req.erm.result         // unfiltered document or object
        const statusCode = req.erm.statusCode // 200

        if(!result){
            console.log('[USER][POST-SAVE] student result not saved')
            next();
        }
        console.log('[USER][POST-SAVE] student result saved')

        let _data = {
            student: new ObjectId(result._id),

            add_registrationNumber: ((result.registrationNumber != 'E/XX/XXX') ? true : false),
            add_projects: (result.projects.length>0? true : false),
            add_skills: (result.skills.length>0? true : false),
            add_competitions: (result.competitions.length>0 ? true : false),
            add_awards: (result.awards.length>0 ? true : false),
            add_cocurriculars: (result.cocurriculars.length>0 ? true : false),
            add_extracurriculars: (result.extracurriculars.length>0 ? true : false),
            add_interests: (result.interests.length>0 ? true : false),
        };

        TaskStudent.findOneAndUpdate({student: new ObjectId(result._id)}, _data, {upsert:true}, function(err, result){
            if (err) console.error(err);
            next()
        });
    }
});

restify.serve(router, userModel, {
    postUpdate: function (req, res, next) {
        const result = req.erm.result         // unfiltered document or object
        const statusCode = req.erm.statusCode // 200

        if(!result){
            console.log('[USER][POST-SAVE] user result not saved')
            next();
        }
        console.log('[USER][POST-SAVE] user result saved')

        let _data = {
            user: new ObjectId(result._id),

            add_intro: ((result.title && result.tagline) ? true : false),
            add_profilepic: (result.photo? true : false),
            add_phone: (result.phone? true : false),

            add_link_linkedIn: (result.linksLinkedin? true : false),
            add_link_github: (result.linksGithub? true : false),
            add_link_stackoverflow: (result.linksStackoverflow? true : false),
            add_link_personal: (result.linksPortfolio? true : false),
            add_link_facebook: (result.linksFacebook? true : false),
        }

        console.log(_data)

        TaskUser.findOneAndUpdate({user: new ObjectId(result._id)}, _data, {upsert:true}, function(err, result){
            if (err) console.error(err);
            next()
        });
    }
})
restify.serve(router, projectModel)
restify.serve(router, organizationModel)
restify.serve(router, organizationRepModel)
restify.serve(router, competitionModel)
restify.serve(router, awardModel)
restify.serve(router, cocurricularModel)
restify.serve(router, extracurricularModel)
restify.serve(router, interestModel)
restify.serve(router, skillModel)


router.post('/organization/joinCompany', function(req, res){
    // console.log(req.user);
    // console.log(req.body);

    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_auth = new LoggingActivity({type: 'api_organization_joinCompany', user: _user._id});
    logging_auth.save();

    let _user_new_organization_id = req.body.id;


    organizationRepModel.findOne({email: req.user.email}, function(err, rep){
        if(err){
            console.error('couldn\'t find organizationRep ID to add task');
        } else {
            if(rep){

                TaskRep.findOneAndUpdate({organizationRep: new ObjectId(rep._id)}, {join_company: true}, {upsert:true}, function(err, result){
                    if (err) console.error(err);
                });
            }
        }
    })

    organizationModel.findOne({ organizationRepEmails: { "$in" : [req.user.email]} }, function (err, organization) {

        let _user_email = req.user.email;
        // console.log(organization);

        if(err){
            console.log(err);
            res.status(500).send({'status':'failed'});
            return;
        }

        if(organization){

            // remove from old organization
            organization.organizationRepEmails.splice(organization.organizationRepEmails.indexOf(_user_email));

            organization.save(function(err, organization){
                if(err){
                   res.status(500).send('failed while removing representative from organization');
                } else if(organization){
                    console.log('successfully removed from previous company');                

                } else {
                   res.status(500).send('failed while removing representative from organization: organization not returned');

                }
            })
        }


        console.log('_user_new_organization_id', _user_new_organization_id);
        // adding to the new organization join queue

        let _queue_joinCompany = new queue_joinCompany({
            user_new_organization_id: _user_new_organization_id,
            user_email: _user_email,
        });

        _queue_joinCompany.save(function(err, _saved){

            if(err){
                console.log(err);
                res.status(500).send('Failed to add join request to the queue');
                return;
            }

            if(!_saved){

                console.log('Failed to add join request to the queue');
                res.status(500).send('Failed to add join request to the queue');
                return;   
            }

            res.status(200).send('Join request successfully queued');
        })

    });

})
router.get('/organization/joinCompany', function(req, res){
    // console.log(req.user);
    // console.log(req.body);

    let _user = JSON.parse(JSON.stringify(req.user));
    
    queue_joinCompany.findOne({user_email: _user.email}, function(err, queue){
        if(err){
            console.log(err);
            res.status(500).send(err);
            return;
        }
        if(queue){
            res.send(queue);
            return;
        } else {
            res.status(200).send();
            return;
        }

    })

})

router.post('/interest/addProfile', function(req, res){
    // console.log(req.user);
    // console.log(req.body);


    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_auth = new LoggingActivity({type: 'api_interest_addProfile', user: _user._id});
    logging_auth.save();

    let _user_new_interest_id = req.body.id;

    interestModel.findById(_user_new_interest_id, function(err, _interest){
        if(err){
            console.log(err);
            res.status(500).send('failed to get interests');
            return;
        }

        if(_interest){

            let _usertype = _user.role;

            if(_usertype.indexOf("STUDENT") >= 0){
                _interest.students.push(_user._id)
                studentModel.addInterest(_user._id, _user_new_interest_id);
            }
            if(_usertype.indexOf("COMPANY") >= 0){
                _interest.organizationRep.push(_user._id)
                organizationRepModel.addInterest(_user._id, _user_new_interest_id);
            }

            _interest.save(function(err, _saved){
                if(err){
                    console.log(err);
                    res.status(500).send('failed to get interests');
                    return;
                }
                res.status(200).send('success: added to interested list');


            })

        } else {
            console.log('failed to get the specified interests');
            res.status(500).send('failed to get the specified interests');
            return;
        }

    })
    

})

function addReqUserIfLoggedIn(req, res, next) {

    // console.log(req);
    if(!req.header('authorization')){
        next();
        return;
    }
    var token = req.header('authorization').replace('Bearer ', '');
    // console.log('[token]', token);
    jwt.verify(token, config.secret, function(err, decoded) {
        if (!err) {
            req.user = decoded;
            next();
        } else {
            next();
        }
    })

}
function isLoggedIn(req, res, next) {

    // console.log(req);

    if(!req.header('authorization')){
        res.status(401).send({
            signedIn: false,
            tokenValid: false,
            flashMessage: 'Couldn\'t find a valid token. Please sign in to retrieve a token.'
        });
        return;
    }
    var token = req.header('authorization').replace('Bearer ', '');
    // console.log('[token]', token);
    jwt.verify(token, config.secret, function(err, decoded) {
        if (!err) {
            req.user = decoded;
            next();
        } else {
            res.status(401).send({
                signedIn: true,
                tokenValid: false,
                flashMessage: 'Invalid Token. Please sign in to re-validate token.'
            });
            return;
        }
    })

}


module.exports = router;