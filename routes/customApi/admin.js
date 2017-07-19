const CompanyPreference = require('../../models/interviews/companyPreferences');
const Logging = require('../../models/logging/activity');
const TextContent = require('../../models/misc/textContent');
const DateContent = require('../../models/misc/dateContent');
const BooleanContent = require('../../models/misc/booleanContent');

const User = require('../../models/user');
const Student = require('../../models/student');
const OrganizationRep = require('../../models/organizationRep');
const Organization = require('../../models/organization');
const Interest = require('../../models/interest');

const TaskUser = require('../../models/logging/task_user');
const TaskStudent = require('../../models/logging/task_student');
const TaskOrganizationRep = require('../../models/logging/task_organizationRep');
const LoggingActivity = require('../../models/logging/activity');
const ProfileViewsCompany = require('../../models/logging/profile_views_company');
const ProfileViews = require('../../models/logging/profile_views');

const Interview = require('../../models/interviews/interviews');
const Offers = require('../../models/interviews/offers');


const mailer = require('../../controllers/email');

const _ = require('lodash');
const EventEmitter = require('events');
const ObjectId = require('mongoose').Types.ObjectId; 

const queue_joinCompany = require('../../models/queue/joinCompany');

function api(router){

function removeUnusedEntriesForUser(_id){
    console.log('[removeUnusedEntriesForUser]', _id);
    CompanyPreference.find({user:new ObjectId(_id)}).remove(function(err){console.log(err)});

    Interest.find({students:{'$in': new ObjectId(_id)}}, function(err, res){
        if(err) return;
        _.forEach(res, function(_interest){
            _interest.students.splice(_interest.students.indexOf(new ObjectId(_id)), 1);
            _interest.save();
        })
    });
    Interest.find({organizationRep:{'$in': new ObjectId(_id)}}, function(err, res){
        if(err) return;
        _.forEach(res, function(_interest){
            _interest.organizationRep.splice(_interest.organizationRep.indexOf(new ObjectId(_id)), 1);
            _interest.save();
        })
    });

    Interview.find({student:new ObjectId(_id)}).remove(function(err){console.log(err)});
    LoggingActivity.find({user:new ObjectId(_id)}).remove(function(err){console.log(err)});
    Offers.find({student:new ObjectId(_id)}).remove(function(err){console.log(err)});
    ProfileViewsCompany.find({viewed_by:new ObjectId(_id)}).remove(function(err){console.log(err)});
    ProfileViews.find({viewed_by:new ObjectId(_id)}).remove(function(err){console.log(err)});
    ProfileViews.find({viewed_profile:new ObjectId(_id)}).remove(function(err){console.log(err)});
    TaskUser.find({user:_id}).remove(function(err){console.log(err)});
}

function removeUnusedEntriesForStudent(_id){
    TaskStudent.find({student:new ObjectId(_id)}).remove(function(err){console.log(err)});
}

function removeUnusedEntriesForOrganizationRep(_id){
    TaskOrganizationRep.find({organizationRep:new ObjectId(_id)}, function(err, rep){
        if(err){
            console.log(err);
            return;
        }
        if(rep){
            console.log('[removeUnusedEntriesForOrganizationRep][REP]', rep);
        }
    }).remove(function(err){console.log(err)});
}


router.get('/admin/companyPreferences', isAdmin, function(req, res){

    CompanyPreference.find({})
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
        // console.log( 'list', list );
        res.status(200).send(list);
    });
});

router.get('/admin/companyPreferences/:user', isAdmin, function(req, res){
    let _user = req.params.user;
    console.log('user', _user)
    CompanyPreference.findOne({user:_user})
    .sort({'createdAt' : -1 })
    .populate(['user', 'preferences'])
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
        // console.log( 'list', list );
        res.status(200).send(list);
    });
});
router.post('/admin/companyPreferences/set', isAdmin, function(req, res){
    
    let _preferences = req.body.data;
    let _error_occurred = false;

    _.forEach(_preferences, function(o){
        let _preferenceEntry = o;
        _preferenceEntry.organization = o.organization._id;
        _preferenceEntry.user = o.user._id;
        delete _preferenceEntry._id;
        
        CompanyPreference.update({user:new ObjectId(_preferenceEntry.user), organization: new ObjectId(_preferenceEntry.organization)}, _preferenceEntry, function(err, list){
            if(err){
                _error_occurred = true;
                console.log(err);
                return;
            }
            console.log('[Updated List]', list);
        });
    });

    if(!_error_occurred){
        res.status(200).send();
        return;
    } else {
        res.status(400).send('failed saving preferences');
    }
});
router.post('/admin/getQueue_joinCompany', isAdmin, function(req, res){
    
    queue_joinCompany.find({}, function(err, queue){
        if(err){
            console.log(err);
            res.status(500).send("Couldn't retrieve queue_joinCompany: Error occurred");
            return;
        }
        if(queue){
            res.send(queue);
            return;
        } else {
            res.status(500).send("Couldn't retrieve queue_joinCompany: Not found")
            return;
        }
    })
});
router.post('/admin/joinCompanyRequest', isAdmin, function(req, res){
    
    let _user_new_organization_id = req.body.user_new_organization_id;
    let _user_email = req.body.user_email;
    let _accepted = req.body.accept;

    if(!_accepted){

        queue_joinCompany.find({user_email: _user_email}).remove(function(err, result){
            if(err){
                console.log(err);
                res.status(500).send();
                return;
            }
            res.send('Queue updated; request declined');
            return;
        });
    }
    
    Organization.findById(_user_new_organization_id, function(err, newOrganization){
        newOrganization.organizationRepEmails.push(_user_email);
        newOrganization.save(function(err, newOrganization){


            if(err){
                res.status(500).send('failed while adding representative to organization');
                return;
            } else if (newOrganization){

                OrganizationRep.findOne({email:_user_email}, function(err, _organizationRep){
                    if(err){
                        console.log(err);
                        res.status(500).send('failed while adding organization to representative');
                        return;
                    }
                    if(!_organizationRep){
                        console.log("Organization representative not found!");
                        res.status(500).send('failed while adding organization to representative');
                        return;
                    }
                    _organizationRep.company = newOrganization._id;
                    _organizationRep.save(function(err){

                        if(err) console.log(err);
                        
                        queue_joinCompany.find({user_email: _user_email}).remove(function(err, result){
                            if(err){
                                console.log(err);
                                res.status(500).send();
                                return;
                            }

                            res.send('Queue updated; request declined');
                            return;
                        });
                    });

                    
                })


            } else {
                res.status(500).send('failed while adding representative to organization: organization not found');
                return;

            }
        })
    })
});
/*
    d88888b d8888b. d888888b d888888b .d8888.
    88'     88  `8D   `88'   `~~88~~' 88'  YP
    88ooooo 88   88    88       88    `8bo.
    88~~~~~ 88   88    88       88      `Y8b.
    88.     88  .8D   .88.      88    db   8D
    Y88888P Y8888D' Y888888P    YP    `8888Y'


*/

router.post('/admin/editEntry/userRoles', isAdmin, function(req, res){
    
    console.log(req.body);
    let _roles = req.body.roles;
    let _id = req.body.id;
    
    if(_.isArray(_roles)){

        User.findById(_id, function(err, _user){

            _user.role = _roles;
            _user.save(function(err,user){
                res.sendStatus(200);
            })
        })
    } else {
        res.status(500).send('invalid roles' + JSON.stringify(_roles));
    }


});


router.post('/admin/uploadBulkData', isAdmin, function(req, res){
    
    let _entity = req.body.entity;
    let _data = req.body.data;

    if(_entity == 'company'){

        
        console.log(_entity,_data);

        let bulk = Organization.collection.initializeOrderedBulkOp();

        _.forEach(_data, function(o){

            let _raw_data = _.cloneDeep(o);
            delete _raw_data._id;

            bulk.find({_id: new ObjectId(o._id)}).upsert().updateOne(_raw_data);

            console.log(o._id);
        })

        bulk.execute(function(err, organizations){
            if(err){
                console.log(err);
                res.status(400).send();
                return;
            }
            if(organizations){
                console.log('[ADMIN][UPDATE]', organizations);
                res.status(200).send();
            } else {

                console.log('no organizations updated');
                res.status(400).send();
            }
        })

    } else {

        res.status(400).send('Invalid Entity: Not handled');
        return;
    }

});


/*
    d8888b. d88888b db      d88888b d888888b d88888b .d8888.
    88  `8D 88'     88      88'     `~~88~~' 88'     88'  YP
    88   88 88ooooo 88      88ooooo    88    88ooooo `8bo.
    88   88 88~~~~~ 88      88~~~~~    88    88~~~~~   `Y8b.
    88  .8D 88.     88booo. 88.        88    88.     db   8D
    Y8888D' Y88888P Y88888P Y88888P    YP    Y88888P `8888Y'


*/

router.post('/admin/deleteEntry', isAdmin, function(req, res){
    
    console.log(req.body);
    let _entity = req.body.entity;
    let _id = req.body.id;

    if(_entity == 'student'){
        let _student_id = _id;
        let _user_id;

        Student.findById(_student_id, function(err, _student){
            _user_id = _student.StudentDetails;
            removeUnusedEntriesForUser(_user_id);
            _student.remove();
            res.sendStatus(200)
        })
        removeUnusedEntriesForStudent(_student_id);


    }  else if(_entity == 'organizationRep'){

        let _rep_id = _id;
        let _user_id;

        OrganizationRep.findById(_rep_id, function(err, _rep){
            _user_id = _rep.OrganizationRepDetails;
            removeUnusedEntriesForUser(_user_id);
            _rep.remove();
            res.sendStatus(200)
        })
        removeUnusedEntriesForOrganizationRep(_rep_id);


    } else if(_entity == 'user'){

        removeUnusedEntriesForUser(_id);

        User.findByIdAndRemove(_id, function(err, user){
            if(err) {
                console.log(err)
                res.status(400).send();
                return;
            }
            if(!user){
                console.log(err)
                res.status(400).send('User not found');
                return;
            }

            res.status(200).send();

        });

    } else if(_entity == 'company'){

        Organization.findByIdAndRemove(_id, function(err, organization){
            if(err) {
                console.log(err)
                res.status(400).send();
                return;
            }
            if(!organization){
                console.log(err)
                res.status(400).send('Organization not found');
                return;
            }

            res.status(200).send();

        });

    } else {

        res.status(400).send('Invalid Entity: Not handled');
        return;
    }

});



/*
    db       .d88b.   d888b  .d8888.
    88      .8P  Y8. 88' Y8b 88'  YP
    88      88    88 88      `8bo.
    88      88    88 88  ooo   `Y8b.
    88booo. `8b  d8' 88. ~8~ db   8D
    Y88888P  `Y88P'   Y888P  `8888Y'


*/

router.get('/admin/logs', isAdmin, function(req, res){
    

    Logging.find({})
    .sort({'createdAt' : -1 })
    .populate(['user'])
    .exec(function(err, list) {
        if(err){
            console.log(err);
            res.status(400).send('failed to receive activity logging');
            return;
        }
        if(!list) {
            res.status(200).send('no activity logging found');
            return;
               
        }
        // console.log( 'list', list );
        res.status(200).send(list);
    });
});

/*
    d888888b d88888b db    db d888888b       .o88b.  .d88b.  d8b   db d888888b d88888b d8b   db d888888b
    `~~88~~' 88'     `8b  d8' `~~88~~'      d8P  Y8 .8P  Y8. 888o  88 `~~88~~' 88'     888o  88 `~~88~~'
       88    88ooooo  `8bd8'     88         8P      88    88 88V8o 88    88    88ooooo 88V8o 88    88
       88    88~~~~~  .dPYb.     88         8b      88    88 88 V8o88    88    88~~~~~ 88 V8o88    88
       88    88.     .8P  Y8.    88         Y8b  d8 `8b  d8' 88  V888    88    88.     88  V888    88
       YP    Y88888P YP    YP    YP          `Y88P'  `Y88P'  VP   V8P    YP    Y88888P VP   V8P    YP


*/

router.post('/admin/update/text', isAdmin, function(req, res){

    let _data = req.body.data;

    console.log('[ADMIN][UPDATE]', _data);

    _.forEach(_data, function(o){

        let _label = o.label;
        let _value = o.value;

        if(_label){
            TextContent.update({label: _label}, {label: _label, value: _value }, {upsert:true}, function(err, num){
                if(err){
                    res.status(400).send();
                    return;
                }
                if(num){
                    console.log('[ADMIN][UPDATE]', _label, num);
                } else {
                    res.status(400).send();
                }
            })
        }
        
    })

    res.send('success');
    return;

});
router.get('/admin/content/text', isAdmin, function(req, res){

    TextContent.find({}, function(err, list){
        if(err){
            res.status(400).send();
            return;
        }
        if(list){
            console.log('[ADMIN][CONTENT]', 'ok');
            res.send(list);
            return;
        }
        res.status(400).send();
    })

});

/*
    d8888b.  .d8b.  d888888b d88888b       .o88b.  .d88b.  d8b   db d888888b d88888b d8b   db d888888b
    88  `8D d8' `8b `~~88~~' 88'          d8P  Y8 .8P  Y8. 888o  88 `~~88~~' 88'     888o  88 `~~88~~'
    88   88 88ooo88    88    88ooooo      8P      88    88 88V8o 88    88    88ooooo 88V8o 88    88
    88   88 88~~~88    88    88~~~~~      8b      88    88 88 V8o88    88    88~~~~~ 88 V8o88    88
    88  .8D 88   88    88    88.          Y8b  d8 `8b  d8' 88  V888    88    88.     88  V888    88
    Y8888D' YP   YP    YP    Y88888P       `Y88P'  `Y88P'  VP   V8P    YP    Y88888P VP   V8P    YP


*/

router.post('/admin/update/date', isAdmin, function(req, res){

    let _data = req.body.data;

    console.log('[ADMIN][UPDATE]', _data);

    _.forEach(_data, function(o){

        let _label = o.label;
        let _value = o.value;

        if(_label){
            DateContent.update({label: _label}, {label: _label, value: _value }, {upsert:true}, function(err, num){
                if(err){
                    res.status(400).send();
                    return;
                }
                if(num){
                    console.log('[ADMIN][UPDATE]', _label, num);
                } else {
                    res.status(400).send();
                }
            })
        }
        
    })

    res.send('success');
    return;

});

/*
    d8b   db  .d88b.  d888888b d888888b d88888b d888888b  .o88b.  .d8b.  d888888b d888888b  .d88b.  d8b   db
    888o  88 .8P  Y8. `~~88~~'   `88'   88'       `88'   d8P  Y8 d8' `8b `~~88~~'   `88'   .8P  Y8. 888o  88
    88V8o 88 88    88    88       88    88ooo      88    8P      88ooo88    88       88    88    88 88V8o 88
    88 V8o88 88    88    88       88    88~~~      88    8b      88~~~88    88       88    88    88 88 V8o88
    88  V888 `8b  d8'    88      .88.   88        .88.   Y8b  d8 88   88    88      .88.   `8b  d8' 88  V888
    VP   V8P  `Y88P'     YP    Y888888P YP      Y888888P  `Y88P' YP   YP    YP    Y888888P  `Y88P'  VP   V8P


*/


router.post('/admin/notification', isAdmin, function(req, res){

    console.log('[ADMIN] /admin/notification')
    let _data = req.body;

    console.log('[ADMIN]', _data)

    let _name = _data.name;
    let _email = _data.email;
    let _title = _data.title;
    let _message = _data.message;
    let _action_link = _data.action_link;
    let _action_title = _data.action_title;


    mailer.sendMail_custom_message(
        {name: _name, email: _email},
        _title,
        _message,
        _action_link, 
        _action_title);



    res.json({
        message: 'Notification queued to be sent'
    });

    return;

});
router.get('/admin/content/date', isAdmin, function(req, res){

    DateContent.find({}, function(err, list){
        if(err){
            res.status(400).send();
            return;
        }
        if(list){
            console.log('[ADMIN][CONTENT]', 'ok');
            res.send(list);
            return;
        }
        res.status(400).send();
    })

});

router.get('/admin/userEvents', isAdmin, function(req, res){

    let _taskUser_data =  {};
    let _taskStudent_data =  {};
    let _taskOrganizationRep_data =  {};

    let _eventEmitter = new EventEmitter();

    let _items = {
        _taskUser_data: false,
        _taskStudent_data: false,
        _taskOrganizationRep_data: false,
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
                taskUser_data: _taskUser_data,
                taskStudent_data: _taskStudent_data,
                taskOrganizationRep_data: _taskOrganizationRep_data,
            });

        }
    });

    TaskUser.find({})
    .populate('user')
    .exec(function( err, list){
        if(list){
            _taskUser_data = list;
        }
        _eventEmitter.emit('done', '_taskUser_data');
    })
    TaskStudent.find({})
    .populate('student')
    .exec(function( err, list){
        if(list){
            _taskStudent_data = list;
        }
        _eventEmitter.emit('done', '_taskStudent_data');
    })
    TaskOrganizationRep.find({})
    .populate('organizationRep')
    .exec(function( err, list){
        if(list){
            _taskOrganizationRep_data = list;
        }
        _eventEmitter.emit('done', '_taskOrganizationRep_data');
    })


});

function isAdmin(req, res, next){
    console.log('checking if an admin...')

    if(_.indexOf(req.user.role, 'ADMIN') !== -1){
        next();
        return;
    }

    res.status(401).send('Unable to authenticate as admin');
    return;
}

}
module.exports = api;