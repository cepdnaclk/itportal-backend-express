// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function(username, password, done) {
            User.findOne({
                email: username
            }, function(err, user) {
                if (err) {
                    return done(err);
                } else if (!user) {
                    return done(null, false, {
                        message: 'Incorrect username.'
                    });
                } else if (!user.validPassword(password)) {
                    return done(null, false, {
                        message: 'Incorrect password.'
                    });
                } else {
                    return done(null, user);
                }
            });
        }
    ));
    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback : true,
        },
        function(req, username, password, done) {
            User.findOne({
                email: username
            }, function(err, user) {
                if (err) {
                    req.flashMessage = 'Couldn\'t create your account. Please try again.';
                    req.signedUp = false;
                    return done(err);
                } else if(!user) {
                    let user = new User();
                    user.email = username;
                    user.password = user.generateHash(password);

                    user.save(function(err, newuser){
                        if(!err){
                            req.flashMessage = 'User Created Successfully!'
                            req.signedUp = true
                            return done(null, newuser);
                        }
                    })
                } else {
                    req.flashMessage = 'This email is already in use!';
                    req.signedUp = false;
                    return done(null, user)
                };
            });
        }
    ));

};