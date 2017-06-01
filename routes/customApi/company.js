const CompanyPreference = require('../../models/interviews/companyPreferences');
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