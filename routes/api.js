var express = require('express');
var router = express.Router();

var listingModel = require('../models/listing');
var userModel = require('../models/user');

const restify = require('express-restify-mongoose');

var jwt = require('jsonwebtoken');
var config = require('../config');

const mailer = require('../controllers/email');

var mime = require('mime');
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function(req, file, cb) {
        cb(null, req.body.email + '-user-' + Date.now() + '.' + mime.extension(file.mimetype))
    }
})
var upload = multer({
    storage: storage
})

var Jimp = require('jimp');



router.use(isLoggedIn);

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({
        message: 'welcome to secured api!'
    });
});


// Image uploads
router.put('/photo/user', upload.single('photo'), function(req, res, next) {
    // console.log(req);
    let _file_name = req.file.filename;
    let _file = req.file.path;

    console.log('public/photo/user/large-' + _file_name);
    Jimp.read(_file).
    then(function(img) {
        img.cover(256,256)
            .quality(90)
            .write('public/photo/user/large-' + _file_name);
        img.cover(64,64)
            .quality(90)
            .write('public/photo/user/small-' + _file_name);


        userModel.findOne({
            email: req.body.email
        }, function(err, user) {
            if (err) {
                res.status(400).send({
                    flashMessage: 'Something went wrong in updating your account.'
                });
                return;
            }
            if (user) {

                user.photo = _file_name;
                user.save(function(err, newuser) {
                    if (!err) {
                        req.user = newuser;

                        res.status(200).send({
                            user: newuser,
                            flashMessage: 'Photos uploaded successfully'
                        });
                    }
                })

            }


        });


    }).catch(function(err) {
        console.log(err)
        res.status(500).send({
            'flashMessage': 'Failed to resize images'
        });
    });
})


// APIs
restify.serve(router, listingModel)
restify.serve(router, userModel)


function isLoggedIn(req, res, next) {
    var token = req.header('authorization').replace('Bearer ', '');
    // console.log('[token]', token);
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

}

module.exports = router;