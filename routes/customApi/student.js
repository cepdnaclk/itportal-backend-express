const CompanyPreference = require('../../models/interviews/companyPreferences');
const Logging = require('../../models/logging/activity');
const Interview = require('../../models/interviews/interviews');
const Offer = require('../../models/interviews/offers');
const Student = require('../../models/student');
const Project = require('../../models/project');
const Interest = require('../../models/interest');

const GetGPA = require('../../controllers/getResults');

const TaskUser = require('../../models/logging/task_user');
const TaskStudent = require('../../models/logging/task_student');

const ProfileViews = require('../../models/logging/profile_views');
const ObjectId = require('mongoose').Types.ObjectId; 
const _ = require('lodash');
const EventEmitter = require('events');

function api(router){

router.post('/student/companyPreferences', isStudent,function(req, res){
    let _user = req.body.user;
    let _organizations = req.body.organizations;
    let _missed_organizations = req.body.missed_organizations;

    let _error_occured = false;


    Student.findOne({email: req.user.email}, function(err, _student){
        if(err){
            console.error('couldn\'t find student ID to add task');
        } else {
            if(_student){

                TaskStudent.findOneAndUpdate({student: new ObjectId(_student._id)}, {set_company_preference: true}, {upsert:true}, function(err, result){
                    if (err) console.error(err);
                });
            }
        }
    })


    _.forEach(_organizations, function(o, i){ // preference and index

        CompanyPreference.findOneAndUpdate({user: _user, organization: o}, {user: _user, organization: o, preference: i}, {upsert: true} , function (err) {
            if (err){
                _error_occured = true;
                console.log(err);
                res.status(400).send('failed');
                return;
            } else {
                console.log('[STUDENT] Student preference created')
                let logging = new Logging({type: 'student_companyPreference_updated', user: _user});
                logging.save();


                CompanyPreference.remove({user: _user, organization: {'$in': _missed_organizations}}, function (err) {
                    if (err){
                        _error_occured = true;
                        console.log(err);
                        res.status(400).send('failed');
                        return;
                    } else {
                        console.log('[STUDENT] Extra Student preference removed')
                        let logging = new Logging({type: 'student_companyPreference_updated', user: _user});
                        logging.save();
                    }
                });
            }
        });

        
    });

    if(!_error_occured){
        res.status(200).send('success');
        return
    }
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
    CompanyPreference.find({user:_user})
    .sort({'createdAt' : -1 })
    .populate(['user','organization'])
    .exec(function(err, list) {
        if(err){
            console.log(err);
            res.status(400).send('failed to receive company preferences');
            return;
        }

        if(!list) {
            res.status(200).send([]);
            return;
               
        }
        console.log( 'list', list );
        res.status(200).send(list);
    });
});
router.get('/student/interviews/all', isStudent, function(req, res){
    let _student_id = req.user._id;
    console.log('student user_id', _student_id);

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
    
    Student.findOne({email: req.user.email}, function(err, _student){
        if(err){
            console.error('couldn\'t find student ID to add task');
        } else {
            if(_student){

                TaskStudent.findOneAndUpdate({student: new ObjectId(_student._id)}, {set_offer_state_accept: true}, {upsert:true}, function(err, result){
                    if (err) console.error(err);
                });
            }
        }
    })


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
            offer.save(function(err, _saved_offer){
                if(err){
                    res.status(400).send('couldn\'t save offer');
                    return;
                }

                if(_saved_offer){
                    let _user = _saved_offer.student;
                    let _organization = _saved_offer.company;

                    CompanyPreference.find({user: _user, organization: _organization}, function(err, _preferences){

                        _.forEach(_preferences, function(_preference){

                            _preference.student_accepted = true;
                            _preference.save();
                            
                        })

                        console.log( 'accepted offer', _offer_id, '  student:', _student_id );
                        res.status(200).send('success');
                        
                    })

                    
                }

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

    Student.findOne({email: req.user.email}, function(err, _student){
        if(err){
            console.error('couldn\'t find student ID to add task');
        } else {
            if(_student){

                TaskStudent.findOneAndUpdate({student: new ObjectId(_student._id)}, {set_offer_state_reject: true}, {upsert:true}, function(err, result){
                    if (err) console.error(err);
                });
            }
        }
    })

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
            offer.save(function(err, _saved_offer){
                if(err){
                    res.status(400).send('couldn\'t save offer');
                    return;
                }

                if(_saved_offer){
                    let _user = _saved_offer.student;
                    let _organization = _saved_offer.company;

                    CompanyPreference.find({user: _user, organization: _organization}, function(err, _preferences){

                        _.forEach(_preferences, function(_preference){

                            _preference.student_accepted = false;
                            _preference.save();
                            
                        })

                        console.log( 'rejected offer', _offer_id, '  student:', _student_id );
                        res.status(200).send('success');
                        
                    })

                    
                }

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

router.get('/student/summary', function(req, res){

    let _profile_count = 0;
    let _tasks_list_user = {};
    let _tasks_list_student = {};

    let _eventEmitter = new EventEmitter();

    let _items = {
        _profile_count: false,
        _tasks_list_user: false,
        _tasks_list_student: false,
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
                profile_count: _profile_count,
                tasks_list_user: _tasks_list_user,
                tasks_list_student: _tasks_list_student,
            });
            return;
        }
    });

    ProfileViews.count({viewed_profile: new ObjectId(req.user._id)})
    .exec(function(err,count){
        if(err){
            res.status(400).send();
            return;
        }
        if(count){
            _profile_count = count;
        }
        _eventEmitter.emit('done', '_profile_count');

    })

    TaskUser.findOne({user: new ObjectId(req.user._id)})
    .exec(function(err,_task_user){
        if(_task_user){
            _tasks_list_user = _task_user;
        }

        _eventEmitter.emit('done', '_tasks_list_user');
    });

    Student.findOne({email: req.user.email}, function(err, student){
        if(err){

            _eventEmitter.emit('done', '_tasks_list_student');
            return;
        }
        if(student){
            
            TaskStudent.findOne({student: new ObjectId(student._id)})
            .exec(function(err, _task_student){
                if( _task_student){
                    _tasks_list_student =  _task_student;
                }

                _eventEmitter.emit('done', '_tasks_list_student');
            });

        } else {
            _eventEmitter.emit('done', '_tasks_list_student');
        }
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


router.post('/student/interest/remove', function(req, res){

    let _interest_id = req.body.interestId;
    let _student_id = req.body.studentId;

    Student.findById(_student_id, function(err, _student){
        if(err){
            console.log(err);
            res.status(500).send(err);
            return;
        }
        if(!_student){
            console.log('Invalid student ID');
            res.status(500).send('Invalid student ID');
            return;
        }
        _student.interests.splice(new ObjectId(_student.interests.indexOf(_interest_id)),1);
        _student.save(function(_err,_saved_student){

            if(_err){
                console.log(_err);
                res.status(500).send(_err);
                return;
            }
            if(!_saved_student){
                console.log('Student interests were not updated');
                res.status(500).send('Interests were not updated');
                return;
            }

            Interest.findById(_interest_id, function(err, _interest){
                if(err){ console.log(err); res.status(500).send('Interest fields were not updated'); return}
                if(!_interest) { console.log('Interest not found'); res.status(500).send('Interest not found'); return}
                _interest.students.splice(_interest.students.indexOf(new ObjectId(_student_id), 1));
                _interest.save(function(err, _saved_interest){
                    if(err){
                        console.log(err);
                        return;
                    }
                    if(!_saved_interest) {
                        console.log('interest_not_saved');
                        return;
                    }
                    console.log('interests were saved');
                })
            })
            res.status(200).send();
        })
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