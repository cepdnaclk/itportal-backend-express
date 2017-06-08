const CompanyPreference = require('../../models/interviews/companyPreferences');
const Logging = require('../../models/logging/activity');
const _ = require('lodash');

function api(router){


router.get('/admin/companyPreferences', isAdmin, function(req, res){

    CompanyPreference.find({})
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