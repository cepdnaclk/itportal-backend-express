const CompanyPreference = require('../../models/interviews/companyPreferences');
const Logging = require('../../models/logging/activity');
const Interview = require('../../models/interviews/interviews');

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
        console.log( 'list', list );
        res.status(200).send(list);
    });
});
router.get('/student/getResults', function(req, res){

    let _reg_num = req.query.regNum;

    console.log('_reg_num', _reg_num);
    res.status(200).send(GetGPA.getStudentResults(_reg_num));

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