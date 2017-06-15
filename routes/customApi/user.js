const Logging = require('../../models/logging/activity');
const User = require('../../models/user');

const _ = require('lodash');
const EventEmitter = require('events');
const ObjectId = require('mongoose').Types.ObjectId; 

function api(router){


router.post('/user/changePassword', function(req, res){
    console.log('[changePassword]', req.user._id);
    console.log('[changePassword]', req.body);

    let _current_password = req.body.password_current;
    let _new_password = req.body.password_new;

    let _logging = new Logging({type: 'password_change_request', user: req.user._id})
    _logging.save();

    User.findById(req.user._id, function(err, user){
        if(err){
            res.status(400).send('user not found');
            return;
        }
        if(user){
            if(user.validPassword(_current_password)){
                user.password = user.generateHash(_new_password);

                 user.save(function(err, newuser){
                    if(err){   
                        res.status(400).send('invalid password');
                        return;
                    }
                    res.status(200).send('success');
                    return;
                })

            } else {

                res.status(400).send('user not found');
                return;
            }
        }
    })
});

}
module.exports = api;