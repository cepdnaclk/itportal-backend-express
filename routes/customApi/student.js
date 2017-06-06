const CompanyPreference = require('../../models/interviews/companyPreferences');
const Logging = require('../../models/logging/activity');
const Interview = require('../../models/interviews/interviews');
const Offer = require('../../models/interviews/offers');
const Student = require('../../models/student');
const Project = require('../../models/project');

const GetGPA = require('../../controllers/getResults');

const ObjectId = require('mongoose').Types.ObjectId; 
const _ = require('lodash');

function api(router){

router.post('/student/companyPreferences', isStudent,function(req, res){
    let _user = req.body.user;
    let _preferences = req.body.preferences;


    CompanyPreference.findOneAndUpdate({user: _user}, {preferences: _preferences }, {upsert: true} , function (err) {
        if (err){
            console.log(err);
            res.status(400).send('failed');
        } else {
            console.log('[STUDENT] Student preference created')
            let logging = new Logging({type: 'student_companyPreference_updated', user: _user});
            logging.save();
            res.status(200).send('success');
        }
    });
});
router.post('/student/projects', isStudent,function(req, res){
    let _user = req.body.user;
    let _project_ids = _.map(req.body.projects, function(o){
        return new ObjectId(o);
    });



    Project.find({_id:{$in: _project_ids}})
    .populate(['skills'])
    .exec(function(err, list){
        if(err){
            console.log(err);
            res.status(400).send('Sending Query results for Projects failed.')
            return;
        }
        if(list){
            res.status(200).send(list);
            return;
        } else {
            console.log(err);
            res.status(400).send('No results for Projects found.')
            return;
        }
    })
});
router.get('/student/companyPreferences/:user', isStudent,function(req, res){
    let _user = req.params.user;
    console.log('user', _user)
    CompanyPreference.findOne({user:_user})
    .sort({'createdAt' : -1 })
    .populate('preferences')
    .exec(function(err, list) {
        if(err){
            console.log(err);
            res.status(400).send('failed to receive company preferences');
            return;
        }

        if(!list) {
            res.status(200).send('preferences were not set before');
            return;
               
        }
        console.log( 'list', list );
        res.status(200).send(list);
    });
});
router.get('/student/interviews/all', isStudent, function(req, res){
    let _student_id = req.user._id;
    console.log('student_id', _student_id);

    Interview.find({student:new ObjectId(_student_id)})
    .populate(['company'])
    .exec(function(err, list) {
        if(err){
            console.log(err);
            res.status(400).send('failed to receive interviews');
            return;
        }

        if(!list) {
            res.status(200).send('interviews were not set before');
            return;
               
        }
        // console.log( 'list', list );
        res.status(200).send(list);
    });
});

router.get('/student/offers/all', isStudent, function(req, res){
    let _student_id = req.user._id;
    console.log('student_id', _student_id);

    Offer.find({student:new ObjectId(_student_id)})
    .populate(['company'])
    .exec(function(err, list) {
        if(err){
            console.log(err);
            res.status(400).send('failed to receive offers');
            return;
        }

        if(!list) {
            res.status(200).send('offers were not set before');
            return;
               
        }
        // console.log( 'list', list );
        res.status(200).send(list);
    });
});

router.post('/student/offers/accept', isStudent, function(req, res){
    let _student_id = req.user._id;
    let _offer_id = req.body.offer_id;

    console.log('student_id', _student_id);

    Offer.findById(_offer_id)
    .exec(function(err, offer) {
        if(err){
            console.log(err);
            res.status(400).send('failed to receive offers');
            return;
        }

        if(!offer) {
            res.status(200).send('invalid offer');
            return;
               
        }

        if(_.isEqual(offer.student, new ObjectId(_student_id))){
            offer.accepted = true;
            offer.save(function(err, offer){
                if(err){
                    res.status(400).send('couldn\'t save offer');
                    return;
                }

                console.log( 'accepted offer', _offer_id, '  student:', _student_id );
                res.status(200).send('success');

            })
        } else {
            console.log( 'failed to accept offer', _offer_id, '  student:', _student_id );
            res.status(400).send('failed');

        }
    });
});

router.post('/student/offers/reject', isStudent, function(req, res){
    let _student_id = req.user._id;
    let _offer_id = req.body.offer_id;

    console.log('student_id', _student_id);

    Offer.findById(_offer_id)
    .exec(function(err, offer) {
        if(err){
            console.log(err);
            res.status(400).send('failed to receive offers');
            return;
        }

        if(!offer) {
            res.status(200).send('invalid offer');
            return;
               
        }

        if(_.isEqual(offer.student, new ObjectId(_student_id))){
            offer.accepted = false;
            offer.save(function(err, offer){
                if(err){
                    res.status(400).send('couldn\'t save offer');
                    return;
                }

                console.log( 'accepted offer', _offer_id, '  student:', _student_id );
                res.status(200).send('success');

            })
        } else {
            console.log( 'failed to accept offer', _offer_id, '  student:', _student_id );
            res.status(400).send('failed');

        }
    });
});

router.get('/student/getResults', function(req, res){

    let _reg_num = req.query.regNum;

    console.log('_reg_num', _reg_num);
    GetGPA.getStudentResults(_reg_num, function(results){
        res.status(200).send(results);        
    })

});
router.post('/student/updateRegNumber', function(req, res){

    let _reg_num = req.body.reg_num;
    let _student_id = req.body.student_id;

    Student.count({registrationNumber: _reg_num})
    .exec(function(err, count){
        if(err){
            res.status(400).send({status: 'Failed to read student count data'});
            return;
        }
        if(count == 0){

            Student.findById(_student_id, function(err, student){
                if(err) {
                    res.status(200).send({status: 'Failed to read student data'});
                    return;
                }
                student.registrationNumber = _reg_num;
                student.save(function(err, student){
                    if(err){
                        res.status(400).send({status: 'Failed to save student data'});
                        return;
                    }

                    res.status(200).send({status: 'success'});

                });
            })
        } else {
            res.status(200).send({status: 'Registration Number already exists'});
        }
    })
});

function isStudent(req, res, next){
    console.log('checking if a student...')

    if(_.indexOf(req.user.role, 'STUDENT') !== -1){
        next();
        return;
    }

    res.status(401).send('Unable to authenticate as company');
    return;
}
}

module.exports = api;