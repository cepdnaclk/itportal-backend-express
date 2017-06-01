const CompanyPreference = require('../../models/interviews/companyPreferences');
const Logging = require('../../models/logging/activity');

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