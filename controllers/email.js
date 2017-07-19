'use strict';
const nodemailer = require('nodemailer');
const ejs = require('ejs')
const config = require('../config');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ahtimadhusanka@gmail.com',
        pass: 'kfafdenjcxrcukrt'
    }
});




module.exports = {
    sendTestMail: function() {
        // setup email data with unicode symbols
        let mailOptions = {
            from: '"IT Portal" <itportal@eng.pdn.ac.lk>', // sender address
            to: 'ahtimadhusanka@gmail.com', // list of receivers
            subject: 'Hello', // Subject line
            text: 'Hello world ?', // plain text body
            html: '<b>Hello world ?</b>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
    },
    sendTestMailHTML: function() {
        let user = {name: 'Test User', role: 'Student', email: 'ahtimadhusanka@gmail.com'};
        let action_url = 'http://itportal.ce.pdn.ac.lk/';
        let _template = 'call_to_action.ejs';
        let _data = {
            title: '[ITPortal] Confirm Account',
            heading1: 'Hello, ' + user.name,
            message: 'Please confirm your brand new account at Industrial Training Portal',
            call_to_action_url: action_url,
            call_to_action_title: 'Confirm Account',
            support_email: config.supportEmail,
            resource_url: config.frontEndUrl,
        }

        ejs.renderFile('views/email/' + _template, _data, function(err, _htmlstring) {

            // setup email data with unicode symbols
            let _plainText = 'Hello, ' + user.name + ',\r\n\r\nPlease confirm your brand new account at,\r\n' + action_url;
            let mailOptions = {
                from: '"IT Portal" <itportal@eng.pdn.ac.lk>', // sender address
                to: user.email, // list of receivers
                subject: _data.title, // Subject line
                text: _plainText, // plain text body
                html: _htmlstring // html body
            };

            if(!err){

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Message %s sent: %s', info.messageId, info.response);
                });
                
            } else {
                console.log(err);
            }

        });


    },

    sendMail_confirm_account: function(user, action_url) {

        let _template = 'call_to_action.ejs';
        let _data = {
            title: '[ITPortal] Confirm Account',
            heading1: 'Hello, ' + user.name,
            message: 'Please confirm your brand new account at Industrial Training Portal',
            call_to_action_url: action_url,
            call_to_action_title: 'Confirm Account',
            support_email: config.supportEmail,
            resource_url: config.frontEndUrl,
        }

        ejs.renderFile('views/email/' + _template, _data, function(err, _htmlstring) {

            // setup email data with unicode symbols
            let _plainText = 'Hello, ' + user.name + ',\r\n\r\nPlease confirm your brand new account at,\r\n' + _data.call_to_action_url;
            let mailOptions = {
                from: '"IT Portal" <itportal@eng.pdn.ac.lk>', // sender address
                to: user.email, // list of receivers
                subject: _data.title, // Subject line
                text: _plainText, // plain text body
                html: _htmlstring // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });

        });


    },

    sendMail_confirm_account_done: function(user) {

        let _template = 'notification.ejs';
        let _data = {
            title: '[ITPortal] Account Successfully Confirmed',
            heading1: 'Well done, ' + user.name,
            message: 'Your account has been successfully confirmed.',
            call_to_action_url: config.frontEndUrl + 'dashboard',
            call_to_action_title: 'View Dashboard',
            support_email: config.supportEmail,
            resource_url: config.frontEndUrl,
        }

        ejs.renderFile('views/email/' + _template, _data, function(err, _htmlstring) {

            // setup email data with unicode symbols
            let _plainText = 'Hello, ' + user.name + ',\r\n\r\nPlease confirm your brand new account at,\r\n' + _data.call_to_action_url;
            let mailOptions = {
                from: '"IT Portal" <itportal@eng.pdn.ac.lk>', // sender address
                to: user.email, // list of receivers
                subject: _data.title, // Subject line
                text: _plainText, // plain text body
                html: _htmlstring // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });

        });


    },

    sendMail_custom_message: function(user, title, message, call_to_action_url,  call_to_action_title) {

        let _template = 'notification.ejs';
        let _data = {
            title: title  || '[ITPortal] notification',
            heading1: user.name ? ('Hello, ' + user.name) : 'Hello',
            message: message || "Just wondering why you didn't sign in recently.. :)",
            call_to_action_url: call_to_action_url || (config.frontEndUrl + 'dashboard'),
            call_to_action_title: call_to_action_title || 'View Dashboard',
            support_email: config.supportEmail,
            resource_url: config.frontEndUrl,
        }

        console.log('[sendMail_custom_message]')

        ejs.renderFile('views/email/' + _template, _data, function(err, _htmlstring) {

            if(err){
                console.log(err);
                return;
            }

            // setup email data with unicode symbols
            let _plainText = 'Hello, ' + user.name + ',\r\n\r\n' + _data.message + ',\r\n' + _data.call_to_action_url;

            let mailOptions = {
                from: '"IT Portal" <itportal@eng.pdn.ac.lk>', // sender address
                to: user.email, // list of receivers
                subject: _data.title, // Subject line
                text: _plainText, // plain text body
                html: _htmlstring // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });

        });


    }
}