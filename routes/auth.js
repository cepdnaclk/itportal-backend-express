const express = require('express');
const router = express.Router();


const passport = require('passport');
const passport_logic = require('../config/passport')(passport);


const jwt = require('jsonwebtoken');
const config = require('../config');

const auth_controller = require('../controllers/auth')

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('Welcome to auth! :P ')
});

router.post('/login', passport.authenticate('local-login'), function(req, res) {
    let _user = JSON.parse(JSON.stringify(req.user));

    let _token = jwt.sign(_user, config.secret, {
        expiresIn: '1hr'
    });

    delete _user.password;
    delete _user.emailConfirmationHash;
    res.status(200).send({
        message: req.flashMessage || 'Success',
        token: _token,
        user: _user
    })
});
router.post('/refreshtoken', isValidToken, function(req, res) {
    let _token = jwt.sign(_user, config.secret, {
        expiresIn: '1hr'
    });

    res.status(200).send({
        message: req.flashMessage,
        token: _token,
    })
});

router.post('/signup', passport.authenticate('local-signup'), auth_controller.signup, function(req, res) {

    let _user = JSON.parse(JSON.stringify(req.user));
    delete _user.password;
    delete _user.emailConfirmationHash;

    res.send({
        signedUp: req.signedUp,
        message: req.flashMessage || 'Success',
        user: _user
    });
});
router.post('/confirm', auth_controller.confirm, function(req, res) {

    let _user = JSON.parse(JSON.stringify(req.user));
    delete _user.password;
    delete _user.emailConfirmationHash;

    res.send({
        signedUp: req.signedUp,
        message: req.flashMessage || 'Success',
        user: _user
    });
});
router.post('/resendconfirmation', auth_controller.resendConfirmation, function(req, res) {
    res.status(200).send({
        flashMessage: 'Email Confirmation sent.'
    });
});

router.post('/logout', function(req, res) {
    req.logout();
    res.status(200).send({
        flashMessage: 'Successfully Signed out.'
    });
});

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated()) {
        var token = req.header('authorization').replace('Bearer ', '');
        console.log('[token]', token);
        jwt.verify(token, config.secret, function(err, decoded) {
            if (!err) {
                next();
            } else {
                res.status(401).send({
                    signedIn: true,
                    tokenValid: false,
                    flashMessage: 'Invalid Token. Please sign in to re-validate token.'
                });
                return;
            }
        })
    } else {
        res.status(401).send({
            signedIn: false,
            flashMessage: 'User session expired. Please sign in to re-validate token.'
        });
        return;
    }

}

function isValidToken(req, res, next) {

    var token = req.header('authorization').replace('Bearer ', '');

    jwt.verify(token, config.secret, function(err, decoded) {
        if (!err) {
            next();
        } else {
            res.status(401).send({
                tokenValid: false,
                flashMessage: 'Invalid Token. Please sign in to re-validate token.'
            });
            return;
        }
    })
}

module.exports = router;