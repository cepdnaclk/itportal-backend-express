const CompanyPreference = require('../../models/interviews/companyPreferences');
const Interview = require('../../models/interviews/interviews');
const Organization = require('../../models/organization');
const Logging = require('../../models/logging/activity');
const _ = require('lodash');

function api(router){


router.get('/company/companyPreferences/:email', isCompany, function(req, res){

    let _email = req.params.email;
    let _company_id;

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
        }


    })

    //  Query company information
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

        // start of grouping

        let _company_preferences = list;
        if(!_company_preferences){
            return;
        }

        // add order ID for companies
        _.forEach(_company_preferences, function(o){
            _.forEach(o.preferences, function(c, i){
                c.preferenceOrder = i;
            })
        })

        let _preferencesByCompany = {};

        _.forEach(_company_preferences, function(o){    // preferences with o.user(with preference order) and o.companies

            _.forEach(o.preferences, function(c){  // c - company

                // each company
                let _user = Object.create(o.user);
                _user.preferenceOrder = c.preferenceOrder;

                if(_preferencesByCompany[c._id]){
                    _preferencesByCompany[c._id].user.push(_user);
                } else {
                    _preferencesByCompany[c._id] = {
                        company: c,
                        user: [_user]
                    }
                }
            });

        });

        _.forEach(_preferencesByCompany, function(o){
            // console.log('o', o);
            o.user = _.sortBy(o.user, function(u){
                return u.preferenceOrder;
            })
        })

        // end of grouping

        res.status(200).send(_preferencesByCompany[_company_id]);
    });
});

router.post('/company/interview/new', function(req, res){
    let _companyRep_email = req.body.companyRepEmail;
    let _student_id = req.body.studentId;

    let _company_id;

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