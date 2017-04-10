const User = require('../models/user');
const mailer = require('../controllers/email');
const config = require('../config');
const shortid = require('shortid');

module.exports = {
    signup: function(req, res, next) {

        User.findOne({
            email: req.user.email
        }, function(err, user) {
            if (err) {
                res.status(400).send({
                    flashMessage: 'Something went wrong in creating your account.'
                });
                return;
            }
            if (user) {

                user.role = req.body.role;
                user.name = req.body.name;
                user.emailConfirmed = false;
                var _emailConfirmation_shortid = shortid.generate();
                user.emailConfirmationHash = user.generateConfirmationHash(_emailConfirmation_shortid);

                user.save(function(err, newuser) {
                    if (!err) {
                        req.user = newuser;
                        mailer.sendMail_confirm_account(newuser, config.frontEndUrl + 'dashboard/confirm/' + _emailConfirmation_shortid);
                        next();

                    } else {
                        console.log(err);
                        next();

                    }
                })

            } else {
                next();
            }
        });

    },
    confirm: function(req, res, next) {

        User.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                res.status(400).send({
                    flashMessage: 'Something went wrong in confirming your email.'
                });
                return;
            }
            if (user) {
                if (user.validConfirmationHash(req.body.token)) {
                    user.emailConfirmed = true;
                    user.save(function(err, newuser) {
                        if (!err) {
                            req.user = newuser;
                            mailer.sendMail_confirm_account_done(newuser);
                            req.flashMessage = "Your account has been confirmed"
                            next();

                        } else {
                            console.log(err);
                            next();

                        }
                    })

                } else {
                    res.status(400).send({
                        flashMessage: 'Failed to Confirm with the given token. Try again.'
                    });
                }

            } else {
                next();
            }
        });

    },
    resendConfirmation: function(req, res, next) {

        User.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                res.status(400).send({
                    flashMessage: 'Did you create an account? Sign up now.'
                });
                return;
            }
            if (user) {
                user.emailConfirmed = false;
                var _emailConfirmation_shortid = shortid.generate();
                user.emailConfirmationHash = user.generateConfirmationHash(_emailConfirmation_shortid);

                user.save(function(err, newuser) {
                    if (!err) {
                        req.user = newuser;
                        mailer.sendMail_confirm_account(newuser, config.frontEndUrl + 'dashboard/confirm/' + _emailConfirmation_shortid);
                        next();

                    } else {
                        res.status(400).send({
                            flashMessage: 'Couldn\'t send a confirmation email. Try again.'
                        });
                        return;
                    }
                })

            } else {
                next();
            }
        });

    }
}