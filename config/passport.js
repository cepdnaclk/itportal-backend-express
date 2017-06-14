// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
var LdapStrategy = require('passport-ldapauth');

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

    /*
        db       .d88b.   .o88b.  .d8b.  db              .d8b.  db    db d888888b db   db
        88      .8P  Y8. d8P  Y8 d8' `8b 88             d8' `8b 88    88 `~~88~~' 88   88
        88      88    88 8P      88ooo88 88             88ooo88 88    88    88    88ooo88
        88      88    88 8b      88~~~88 88      C8888D 88~~~88 88    88    88    88~~~88
        88booo. `8b  d8' Y8b  d8 88   88 88booo.        88   88 88b  d88    88    88   88
        Y88888P  `Y88P'   `Y88P' YP   YP Y88888P        YP   YP ~Y8888P'    YP    YP   YP


    */


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

    /*
        db      d8888b.  .d8b.  d8888b.
        88      88  `8D d8' `8b 88  `8D
        88      88   88 88ooo88 88oodD'
        88      88   88 88~~~88 88~~~
        88booo. 88  .8D 88   88 88
        Y88888P Y8888D' YP   YP 88


    */
    let getLDAPConfiguration = function(req, callback) {

      _searchFilter = '(uid=' + req.body.name + ')';

      var opts = {
          server: {
            url: 'ldap://openldap.ce.pdn.ac.lk:389',
            searchBase: 'ou=people,dc=ce,dc=pdn,dc=ac,dc=lk',
            searchFilter: _searchFilter
          },
          usernameField: 'name',
          passwordField: 'password',
          passReqToCallback : true,
        };
        console.log('[SIGNUP/IN][LDAP][CONFIG]', _searchFilter);
        console.log('[SIGNUP/IN][LDAP][CONFIG]', opts);
        // return opts;

        callback(null, opts);

    };

    passport.use('ldap-login', new LdapStrategy( getLDAPConfiguration,
        function(req, _ldap_user, done) {

            User.findOne({
                email: _ldap_user.mail
            }, function(err, user) {
                if (err) {
                    return done(err);
                } else if (!user) {
                    return done(null, false, {
                        message: 'Incorrect username.'
                    });
                } else {
                    return done(null, user);
                }
            });
        }
    ));

    passport.use('ldap-signup', new LdapStrategy( getLDAPConfiguration,
        function(req, _ldap_user, done) {
            console.log(_ldap_user);
            User.findOne({
                email: _ldap_user.mail
            }, function(err, user) {
                if (err) {
                    req.flashMessage = 'Couldn\'t create your account. Please try again.';
                    req.signedUp = false;
                    return done(err);
                } else if(!user) {
                    let user = new User();
                    user.email = _ldap_user.mail;
                    user.name = _ldap_user.displayName;

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