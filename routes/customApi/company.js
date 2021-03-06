const CompanyPreference = require('../../models/interviews/companyPreferences');
const Interview = require('../../models/interviews/interviews');
const Offer = require('../../models/interviews/offers');
const Organization = require('../../models/organization');
const User = require('../../models/user');
const OrganizationRep = require('../../models/organizationRep');
const Student = require('../../models/student');
const Logging = require('../../models/logging/activity');
const Project = require('../../models/project');
const Interest = require('../../models/interest');

const TaskUser = require('../../models/logging/task_user');
const TaskRep = require('../../models/logging/task_organizationRep');

const ProfileViews = require('../../models/logging/profile_views');
const ProfileViews_company = require('../../models/logging/profile_views_company');

const mailer = require('../../controllers/email');

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
    console.log('[preference] ', preference._id);

    let _pref_id = new ObjectId(preference._id);
    delete preference['_id'];

    CompanyPreference.findOneAndUpdate({'_id': _pref_id}, preference, function(err, pref){
        if(err){
            console.log(err);
            res.status(500).send('Error updating preferences status')
            return;
        }

        // console.log(pref);
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
    let _interview_date = req.body.date;
    
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

    User.findById(_student_id, function(err, _user){
        if(err){
            console.error(err);
        } else if(!_user) {
            console.error('[newInterview] User not found, to send an email');
        } else {

            mailer.sendMail_custom_message(
                {name: _user.name, email: _user.email},
                "New Interview Scheduled",
                "Well done! You've got a new interview scheduled, go ahead and check the details at the Decision Desk.");

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
            interview.date = _interview_date;

            interview.type = _interview_type;
            interview.type_other = _interview_type_other;
            interview.notes = _interview_notes;

            console.log('[interview]: _company_id', _company_id)
            interview.save(function(err, interview){
                if(err){
                    console.log(err);
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

router.get('/company/interview/all/:companyrepemail', function(req, res){

    let _companyRep_email = req.params.companyrepemail;

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

            Interview.find({company: new ObjectId(_company_id)}, function(err, _interviews){
                if(err) {
                    console.error(err);
                    res.status(400).send('Something went wrong while retrieving interviews');
                    return;
                }
                if(!_interviews){
                    console.log('No interviews found to be scheduled for this company');
                }

                res.status(200).send(_interviews);
            })
    
        } else {
            console.error('something went wrong: failed to receive company details: NOT FOUND')
            res.status(400).send('failed to receive company details');
            return true;
        }


    })



});

router.post('/company/interview/remove/:interview_id', function(req, res){

    let _interview_id = req.params.interview_id;

    Interview.findByIdAndRemove( _interview_id, function(err, result){
        if(err) {
            console.error(err);
            res.status(400).send('Something went wrong while removing interviews');
            return;
        }
        if(!result){
            console.log('Interview not found');
        }

        res.status(200).send(result);
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

    User.findById(_student_id, function(err, _user){
        if(err){
            console.error(err);
        } else if(!_user) {
            console.error('[newInterview] User not found, to send an email');
        } else {

            mailer.sendMail_custom_message(
                {name: _user.name, email: _user.email},
                "New Internship Offer",
                "Congratulations! You've got a new internship offer, go ahead and check the details at the Decision Desk.");

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
    let _profile_views_count = 0;
    let _profile_views = {};
    let _company_profile_views_count = 0;
    let _company_profile_views = {};
    let _tasks_list_user = {};
    let _tasks_list_rep = {};

    let _eventEmitter = new EventEmitter();

    let _items = {
        _profile_views_count: false,
        _profile_views: false,
        _company_profile_views_count: false,
        _company_profile_views: false,
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
                profile_views_count: _profile_views_count,
                profile_views: _profile_views,
                company_profile_views_count: _company_profile_views_count,
                company_profile_views: _company_profile_views,
                tasks_list_user: _tasks_list_user,
                tasks_list_rep: _tasks_list_rep,
            });
            return;
        }
    });

    // ProfileViews.count({viewed_profile: new ObjectId(req.user._id)})
    // .exec(function(err,count){
    //     if(count){
    //         _profile_count = count;
    //     }

    //     _eventEmitter.emit('done', '_profile_count');
    // });

    ProfileViews.find({viewed_profile: new ObjectId(req.user._id)})
    .populate('viewed_by')
    .exec(function(err,_t_profile_views_count){
        if(err){
            console.log(err);
        }

        if(_t_profile_views_count){
            _profile_views_count = _t_profile_views_count.length;
            _profile_views = _t_profile_views_count;
        }

        _eventEmitter.emit('done', '_profile_views_count');
        _eventEmitter.emit('done', '_profile_views');
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
            _eventEmitter.emit('done', '_company_profile_views_count');
            _eventEmitter.emit('done', '_company_profile_views');
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

            // ProfileViews_company.count({viewed_company: new ObjectId(rep.company)}, function(err, _company_count){
            //     if(err){
            //         console.log(err);
            //     }
            //     if(_company_count){
            //         _company_profile_count = _company_count;
            //     }
            //     _eventEmitter.emit('done', '_company_profile_count');
            // })

            ProfileViews_company.find({viewed_company: new ObjectId(rep.company)})
            .populate('viewed_by')
            .exec(function(err, _t_company_views){
                if(err){
                    console.log(err);
                }
                if(_t_company_views){
                    _company_profile_views_count = _t_company_views.length;
                    _company_profile_views = _t_company_views;
                }
                _eventEmitter.emit('done', '_company_profile_views_count');
                _eventEmitter.emit('done', '_company_profile_views');
            })

        } else {
            _eventEmitter.emit('done', '_tasks_list_rep');
            _eventEmitter.emit('done', '_company_profile_views_count');
            _eventEmitter.emit('done', '_company_profile_views');
        }
    });


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