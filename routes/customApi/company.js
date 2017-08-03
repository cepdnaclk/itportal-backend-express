const CompanyPreference = require('../../models/interviews/companyPreferences');
const Interview = require('../../models/interviews/interviews');
const Offer = require('../../models/interviews/offers');
const Organization = require('../../models/organization');
const OrganizationRep = require('../../models/organizationRep');
const Student = require('../../models/student');
const Logging = require('../../models/logging/activity');
const Project = require('../../models/project');
const Interest = require('../../models/interest');

const TaskUser = require('../../models/logging/task_user');
const TaskRep = require('../../models/logging/task_organizationRep');

const ProfileViews = require('../../models/logging/profile_views');
const ProfileViews_company = require('../../models/logging/profile_views_company');

const _ = require('lodash');
const ObjectId = require('mongoose').Types.ObjectId; 
const EventEmitter = require('events');

function api(router){


router.get('/company/companyPreferences/:email', isCompany, function(req, res){

    let _email = req.params.email;
    let _company_id;

    console.log(_email, _company_id);

    // Get the user's company id
    Organization.findOne({ organizationRepEmails: { "$in" : [_email]}} , function(err, company){
        // console.log(err, company)
        if(err) {
            console.error('something went wrong')
            res.status(400).send('failed to receive company preferences');
            return true;
        }
        if(company){
            _company_id = company._id;


            //  Query company's preference information
            CompanyPreference.find({organization: _company_id, admin_approved: true})
            .sort({'createdAt' : -1 })
            .populate(['user', 'organization'])
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

                res.status(200).send(list);
            });

        } else {
            res.status(400).send('Company not found')
        }


    })

});


router.post('/company/companyPreferences/set/status', isCompany, function(req, res){
    
    let preference = req.body.preference;

    CompanyPreference.findOneAndUpdate({'_id': new ObjectId(preference._id)}, function(err, pref){
        if(err){
            console.log(err);
            res.status(500).send('Error updating preferences status')
            return;
        }

        res.status(200).send();
        return;

    });
});

router.post('/company/projects', isCompany, function(req, res){
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

router.post('/company/interview/new', function(req, res){

    let _companyRep_email = req.body.companyRepEmail;
    let _student_id = req.body.studentId;
    let _interview_time = req.body.time;
    let _interview_location = req.body.location;
    let _interview_location_lat = req.body.location_lat;
    let _interview_location_lon = req.body.location_lon;
    let _interview_type = req.body.type;
    let _interview_type_other = req.body.type_other;
    let _interview_notes = req.body.notes;

    let _company_id;

    OrganizationRep.findOne({email: _companyRep_email}, function(err, rep){
        if(err){
            console.error('couldn\'t find organizationRep ID to add task');
        } else {
            if(rep){

                TaskRep.findOneAndUpdate({organizationRep: new ObjectId(rep._id)}, {interview_add: true}, {upsert:true}, function(err, result){
                    if (err) console.error(err);
                });
            }
        }
    })

    // Get the user's company id
    Organization.findOne({ organizationRepEmails: { "$in" : [_companyRep_email]}} , function(err, company){
        // console.log(err, company)
        if(err) {
            console.error('something went wrong: failed to receive company details')
            res.status(400).send('failed to receive company details');
            return true;
        }
        if(company){
            _company_id = company._id;

            let interview = new Interview();

            interview.student = _student_id;
            interview.company = _company_id;
            interview.time = _interview_time;
            interview.location = _interview_location;
            interview.location_lat = _interview_location_lat;
            interview.location_lon = _interview_location_lon;
            interview.type = _interview_type;
            interview.type_other = _interview_type_other;
            interview.notes = _interview_notes;

            console.log('[interview]: _company_id', _company_id)
            interview.save(function(err, interview){
                if(err){
                    res.status(400).send(err);
                    return;
                }
                if(!interview){
                    res.status(400).send('Something went wrong while creating the interview');
                    return;            
                }

                res.status(200).send(interview);
            });
    
        } else {
            console.error('something went wrong: failed to receive company details: NOT FOUND')
            res.status(400).send('failed to receive company details');
            return true;
        }


    })



});

router.post('/company/offer/new', function(req, res){
    let _companyRep_email = req.body.companyRepEmail;
    let _student_id = req.body.studentId;

    let _company_id;


    OrganizationRep.findOne({email: req.user.email}, function(err, rep){
        if(err){
            console.error('couldn\'t find organizationRep ID to add task');
        } else {
            if(rep){

                TaskRep.findOneAndUpdate({organizationRep: new ObjectId(rep._id)}, {interview_accept: true}, {upsert:true}, function(err, result){
                    if (err) console.error(err);
                });
            }
        }
    })


    // Get the user's company id
    Organization.findOne({ organizationRepEmails: { "$in" : [_companyRep_email]}} , function(err, company){
        // console.log(err, company)
        if(err) {
            console.error('something went wrong: failed to receive company details')
            res.status(400).send('failed to receive company details');
            return true;
        }
        if(company){
            _company_id = company._id;

            let offer = new Offer();
            offer.student = _student_id;
            offer.company = _company_id;
            console.log('[offer]: _company_id', _company_id)
            offer.save(function(err, offer){
                if(err){
                    res.status(400).send(err);
                    return;
                }
                if(!offer){
                    res.status(400).send('Something went wrong while creating the offer');
                    return;            
                }

                res.status(200).send(offer);
                return;
            });
    
        } else {
            console.error('something went wrong: failed to receive company details: NOT FOUND')
            res.status(400).send('failed to receive company details');
            return true;
        }


    })
});

router.get('/company/get/student/:userId', function(req, res){

    let _user_id = req.params.userId;

    Student.findOne({StudentDetails: new ObjectId(_user_id)})
    .populate(['skills'])
    .exec(function(err, student){
        if(err) {
            console.log(err);
            res.status(400).send();
            return
        }

        if(student){
            console.log(student._id);
            res.status(200).send(student);
            return;
        }

        res.send(400).send('student not found');

    })
});

router.get('/company/summary', function(req, res){
    let _profile_count = 0;
    let _company_profile_count = 0;
    let _tasks_list_user = {};
    let _tasks_list_rep = {};

    let _eventEmitter = new EventEmitter();

    let _items = {
        _profile_count: false,
        _company_profile_count: false,
        _tasks_list_user: false,
        _tasks_list_rep: false,
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
                profile_views: _profile_count,
                profile_views_company: _company_profile_count,
                tasks_list_user: _tasks_list_user,
                tasks_list_rep: _tasks_list_rep,
            });
            return;
        }
    });

    ProfileViews.count({viewed_profile: new ObjectId(req.user._id)})
    .exec(function(err,count){
        if(count){
            _profile_count = count;
        }

        _eventEmitter.emit('done', '_profile_count');
    });

    TaskUser.findOne({user: new ObjectId(req.user._id)})
    .exec(function(err,_task_user){
        if(_task_user){
            _tasks_list_user = _task_user;
        }

        _eventEmitter.emit('done', '_tasks_list_user');
    });

    OrganizationRep.findOne({email: req.user.email}, function(err, rep){
        if(err){
            _eventEmitter.emit('done', '_company_profile_count');
            _eventEmitter.emit('done', '_tasks_list_rep');
            return;
        }

        if(rep){
            
            TaskRep.findOne({organizationRep: new ObjectId(rep._id)})
            .exec(function(err,_task_rep){
                if(_task_rep){
                    _tasks_list_rep = _task_rep;
                }

                _eventEmitter.emit('done', '_tasks_list_rep');
            });

            ProfileViews_company.count({viewed_company: new ObjectId(rep.company)}, function(err, _company_count){
                if(err){
                    console.log(err);
                }
                if(_company_count){
                    _company_profile_count = _company_count;
                }
                _eventEmitter.emit('done', '_company_profile_count');
            })
        } else {
            _eventEmitter.emit('done', '_tasks_list_rep');
            _eventEmitter.emit('done', '_company_profile_count');
        }
    })
});


router.post('/companyRep/interest/remove', function(req, res){

    let _interest_id = req.body.interestId;
    let _company_id = req.body.companyId;

    OrganizationRep.findById(_company_id, function(err, _company){
        if(err){
            console.log(err);
            res.status(500).send(err);
            return;
        }
        if(!_company){
            console.log('Invalid company ID');
            res.status(500).send('Invalid company ID');
            return;
        }
        _company.interests.splice(new ObjectId(_company.interests.indexOf(_interest_id)),1);
        _company.save(function(_err,_saved_company){

            if(_err){
                console.log(_err);
                res.status(500).send(_err);
                return;
            }
            if(!_saved_company){
                console.log('Company interests were not updated');
                res.status(500).send('Interests were not updated');
                return;
            }

            Interest.findById(_interest_id, function(err, _interest){
                if(err){ console.log(err); res.status(500).send('Interest fields were not updated'); return}
                if(!_interest) { console.log('Interest not found'); res.status(500).send('Interest not found'); return}
                _interest.organizationRep.splice(_interest.organizationRep.indexOf(new ObjectId(_company_id), 1));
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

function isCompany(req, res, next){
    console.log('checking if a company...')

    if(_.indexOf(req.user.role, 'COMPANY') !== -1){
        next();
        return;
    }

    res.status(401).send('Unable to authenticate as company');
    return;
}

}
module.exports = api;