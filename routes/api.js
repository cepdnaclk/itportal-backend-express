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

const LoggingUserActivity = require('../models/logging/activity');

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



router.use(isLoggedIn);

const studentApi = require('./customApi/student')(router);

/* show welcome message */
router.get('/', function(req, res, next) {

    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_activity = new LoggingUserActivity({type: 'api_bare_route', user: _user._id});
    logging_activity.save();

    res.json({
        message: 'welcome to secured api!'
    });
});

// Image uploads
router.put('/photo/user', upload.single('photo'), function(req, res, next) {
    // console.log(req);
    let _file_name = req.file.filename;
    let _file = req.file.path;


    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_activity = new LoggingUserActivity({type: 'api_photo_user', user: _user._id});
    logging_activity.save();

    console.log('public/photo/user/large-' + _file_name);
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
    // console.log(req);
    let _file_name = req.file.filename;
    let _file = req.file.path;



    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_activity = new LoggingUserActivity({type: 'api_photo_user', user: _user._id});
    logging_activity.save();


    console.log('public/photo/organization/large-' + _file_name);
    Jimp.read(_file).
    then(function(img) {
        img.cover(256,256)
            .quality(90)
            .write('public/photo/organization/large-' + _file_name);
        img.cover(64,64)
            .quality(90)
            .write('public/photo/organization/small-' + _file_name);


        organizationModel.findOne({
            id: req.body.organizationId
        }, function(err, organization) {
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

// APIs
/*
    d8888b. d88888b .d8888. d888888b d888888b d88888b db    db
    88  `8D 88'     88'  YP `~~88~~'   `88'   88'     `8b  d8'
    88oobY' 88ooooo `8bo.      88       88    88ooo    `8bd8'
    88`8b   88~~~~~   `Y8b.    88       88    88~~~      88
    88 `88. 88.     db   8D    88      .88.   88         88
    88   YD Y88888P `8888Y'    YP    Y888888P YP         YP


*/

restify.serve(router, studentModel)
restify.serve(router, userModel)
restify.serve(router, projectModel)
restify.serve(router, organizationModel)
restify.serve(router, organizationRepModel)
restify.serve(router, competitionModel)
restify.serve(router, awardModel)
restify.serve(router, cocurricularModel)
restify.serve(router, extracurricularModel)
restify.serve(router, interestModel)


router.post('/organization/joinCompany', function(req, res){
    // console.log(req.user);
    // console.log(req.body);

    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_auth = new LoggingAuth({type: 'api_organization_joinCompany', user: _user._id});
    logging_auth.save();

    let _user_new_organization_id = req.body.id;

    organizationModel.findOne({ organizationRepEmails: { "$in" : [req.user.email]} }, function (err, organization) {

        let _user_email = req.user.email;
        console.log(organization);

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
        // adding to the new organization
        organizationModel.findById(_user_new_organization_id, function(err, newOrganization){
            newOrganization.organizationRepEmails.push(_user_email);
            newOrganization.save(function(err, newOrganization){
                if(err){
                    res.status(500).send('failed while adding representative to organization');
                } else if (newOrganization){
                    res.status(200).send({status: 'success'});
                } else {
                    res.status(500).send('failed while adding representative to organization: organization not found');

                }
            })
        })

    });

})
router.post('/interest/addProfile', function(req, res){
    // console.log(req.user);
    // console.log(req.body);


    let _user = JSON.parse(JSON.stringify(req.user));
    let logging_auth = new LoggingAuth({type: 'api_interest_addProfile', user: _user._id});
    logging_auth.save();

    let _user_new_interest_id = req.body.id;

    interestModel.findById(_user_new_interest_id, function(err, _interest){
        if(err){
            console.log(err);
            res.status(500).send('failed to get interests');
            return;
        }

        if(_interest){

            let _usertype = _user.role[0];

            if(_usertype === "STUDENT"){
                _interest.students.push(_user._id)
            }
            if(_usertype === "COMPANY"){
                _interest.organizationRep.push(_user._id)
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

function isLoggedIn(req, res, next) {

    console.log(req);

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