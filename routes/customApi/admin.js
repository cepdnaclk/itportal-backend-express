const CompanyPreference = require('../../models/interviews/companyPreferences');
const Logging = require('../../models/logging/activity');
const TextContent = require('../../models/misc/textContent');
const DateContent = require('../../models/misc/dateContent');
const BooleanContent = require('../../models/misc/booleanContent');

const TaskUser = require('../../models/logging/task_user');
const TaskStudent = require('../../models/logging/task_student');
const TaskOrganizationRep = require('../../models/logging/task_organizationRep');

const _ = require('lodash');
const EventEmitter = require('events');
const ObjectId = require('mongoose').Types.ObjectId; 

function api(router){


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