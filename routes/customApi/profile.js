const assert  = require('assert');

const OrganizationRep = require('../../models/organizationRep');
const Student = require('../../models/student');
const Project = require('../../models/project');
const Award = require('../../models/award');
const CoCurricular = require('../../models/cocurricular');
const ExtraCurricular = require('../../models/extracurricular');
const Competition = require('../../models/competition');

const Logging = require('../../models/logging/activity');

const _ = require('lodash');
const ObjectId = require('mongoose').Types.ObjectId; 

function api(router){

/*
    d8888b. d8888b.  .d88b.     d88b d88888b  .o88b. d888888b
    88  `8D 88  `8D .8P  Y8.    `8P' 88'     d8P  Y8 `~~88~~'
    88oodD' 88oobY' 88    88     88  88ooooo 8P         88
    88~~~   88`8b   88    88     88  88~~~~~ 8b         88
    88      88 `88. `8b  d8' db. 88  88.     Y8b  d8    88
    88      88   YD  `Y88P'  Y8888P  Y88888P  `Y88P'    YP


*/

router.delete('/profile/project/:projectId', function(req, res){

    let _projectId = req.params.projectId;

    Student.find({projects: _projectId})
    .populate('projects')
    .exec(function(err, students){

        _.forEach(students, function(_student){
            let _theProject = _.find(_student.projects, function(o){
                return o._id == _projectId;
            });

            _.forEach(_theProject.skills, function(_skill_id){
                let _idx = _student.skills.indexOf(_skill_id);
                if(_idx != -1){
                    _student.skills.splice(_idx, 1);
                }
            })

            _student.projects.splice(_student.projects.indexOf(_projectId),1);
            _student.save();

            Project.remove({_id: new ObjectId(_projectId)})
            .exec(function(err, res){
                if(err){
                    console.error(err);
                } else {
                    console.log('[removeProject] Done');
                }
            })

        });
    })

    OrganizationRep.find({projects: _projectId})
    .populate('projects')
    .exec(function(err, reps){

        _.forEach(reps, function(_rep){
            let _theProject = _.find(_rep.projects, function(o){
                return o._id == _projectId;
            });

            _.forEach(_theProject.skills, function(_skill_id){
                let _idx = _rep.skills.indexOf(_skill_id);
                if(_idx != -1){
                    _rep.skills.splice(_idx, 1);
                }
            })

            _rep.projects.splice(_rep.projects.indexOf(_projectId),1);
            _rep.save();

            Project.remove({_id: new ObjectId(_projectId)})
            .exec(function(err, res){
                if(err){
                    console.error(err);
                } else {
                    console.log('[removeProject] Done');
                }
            })

        });
    })

    res.status(200).send('success');
});

/*
     .d8b.  db   d8b   db  .d8b.  d8888b. d8888b.
    d8' `8b 88   I8I   88 d8' `8b 88  `8D 88  `8D
    88ooo88 88   I8I   88 88ooo88 88oobY' 88   88
    88~~~88 Y8   I8I   88 88~~~88 88`8b   88   88
    88   88 `8b d8'8b d8' 88   88 88 `88. 88  .8D
    YP   YP  `8b8' `8d8'  YP   YP 88   YD Y8888D'


*/

router.delete('/profile/award/:awardId', function(req, res){

    let _awardId = req.params.awardId;

    Student.find({awards: _awardId})
    .exec(function(err, students){

        _.forEach(students, function(_student){

            _student.awards.splice(_student.awards.indexOf(_awardId),1);
            _student.save();

            Award.remove({_id: new ObjectId(_awardId)})
            .exec(function(err, res){
                if(err){
                    console.error(err);
                } else {
                    console.log('[removeAward] Done');
                }
            })

        });
    })

    OrganizationRep.find({awards: _awardId})
    .exec(function(err, reps){

        _.forEach(reps, function(_rep){

            _rep.awards.splice(_rep.awards.indexOf(_awardId),1);
            _rep.save();

            Award.remove({_id: new ObjectId(_awardId)})
            .exec(function(err, res){
                if(err){
                    console.error(err);
                } else {
                    console.log('[removeAward] Done');
                }
            })

        });
    })

    res.status(200).send('success');
});

/*
     .o88b.  .d88b.   .o88b. db    db d8888b. d8888b. d888888b  .o88b. db    db db       .d8b.  d8888b.
    d8P  Y8 .8P  Y8. d8P  Y8 88    88 88  `8D 88  `8D   `88'   d8P  Y8 88    88 88      d8' `8b 88  `8D
    8P      88    88 8P      88    88 88oobY' 88oobY'    88    8P      88    88 88      88ooo88 88oobY'
    8b      88    88 8b      88    88 88`8b   88`8b      88    8b      88    88 88      88~~~88 88`8b
    Y8b  d8 `8b  d8' Y8b  d8 88b  d88 88 `88. 88 `88.   .88.   Y8b  d8 88b  d88 88booo. 88   88 88 `88.
     `Y88P'  `Y88P'   `Y88P' ~Y8888P' 88   YD 88   YD Y888888P  `Y88P' ~Y8888P' Y88888P YP   YP 88   YD


*/

router.delete('/profile/cocurricular/:curricularId', function(req, res){

    let _curricularId = req.params.curricularId;

    Student.find({cocurriculars: _curricularId})
    .exec(function(err, students){

        _.forEach(students, function(_student){

            _student.cocurriculars.splice(_student.cocurriculars.indexOf(_curricularId),1);
            _student.save();

            CoCurricular.remove({_id: new ObjectId(_curricularId)})
            .exec(function(err, res){
                if(err){
                    console.error(err);
                } else {
                    console.log('[removeAward] Done');
                }
            })

        });
    })
    
    res.status(200).send('success');
});

/*
    d88888b db    db d888888b d8888b.  .d8b.   .o88b. db    db d8888b. d8888b. d888888b  .o88b. db    db db       .d8b.  d8888b.
    88'     `8b  d8' `~~88~~' 88  `8D d8' `8b d8P  Y8 88    88 88  `8D 88  `8D   `88'   d8P  Y8 88    88 88      d8' `8b 88  `8D
    88ooooo  `8bd8'     88    88oobY' 88ooo88 8P      88    88 88oobY' 88oobY'    88    8P      88    88 88      88ooo88 88oobY'
    88~~~~~  .dPYb.     88    88`8b   88~~~88 8b      88    88 88`8b   88`8b      88    8b      88    88 88      88~~~88 88`8b
    88.     .8P  Y8.    88    88 `88. 88   88 Y8b  d8 88b  d88 88 `88. 88 `88.   .88.   Y8b  d8 88b  d88 88booo. 88   88 88 `88.
    Y88888P YP    YP    YP    88   YD YP   YP  `Y88P' ~Y8888P' 88   YD 88   YD Y888888P  `Y88P' ~Y8888P' Y88888P YP   YP 88   YD


*/

router.delete('/profile/extracurricular/:extracurricularId', function(req, res){

    let _extracurricularId = req.params.extracurricularId;

    Student.find({extracurriculars: _extracurricularId})
    .exec(function(err, students){

        _.forEach(students, function(_student){

            _student.extracurriculars.splice(_student.extracurriculars.indexOf(_extracurricularId),1);
            _student.save();

            ExtraCurricular.remove({_id: new ObjectId(_extracurricularId)})
            .exec(function(err, res){
                if(err){
                    console.error(err);
                } else {
                    console.log('[removeAward] Done');
                }
            })

        });
    })
    
    res.status(200).send('success');
});

/*
     .o88b.  .d88b.  .88b  d88. d8888b. d88888b d888888b d888888b d888888b d888888b  .d88b.  d8b   db
    d8P  Y8 .8P  Y8. 88'YbdP`88 88  `8D 88'     `~~88~~'   `88'   `~~88~~'   `88'   .8P  Y8. 888o  88
    8P      88    88 88  88  88 88oodD' 88ooooo    88       88       88       88    88    88 88V8o 88
    8b      88    88 88  88  88 88~~~   88~~~~~    88       88       88       88    88    88 88 V8o88
    Y8b  d8 `8b  d8' 88  88  88 88      88.        88      .88.      88      .88.   `8b  d8' 88  V888
     `Y88P'  `Y88P'  YP  YP  YP 88      Y88888P    YP    Y888888P    YP    Y888888P  `Y88P'  VP   V8P


*/

router.delete('/profile/competition/:competitionId', function(req, res){

    let _competitionId = req.params.competitionId;

    Student.find({competitions: _competitionId})
    .exec(function(err, students){

        _.forEach(students, function(_student){

            _student.competitions.splice(_student.competitions.indexOf(_competitionId),1);
            _student.save();

            Competition.remove({_id: new ObjectId(_competitionId)})
            .exec(function(err, res){
                if(err){
                    console.error(err);
                } else {
                    console.log('[removeAward] Done');
                }
            })

        });
    })

    res.status(200).send('success');
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