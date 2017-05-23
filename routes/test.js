const express = require('express');
const router = express.Router();
const config = require('../config');
const mailer = require('../controllers/email');

const Jimp = require('jimp');

/* GET home page. */
router.get('/test', function(req, res) {
    console.log('test function');
    res.send({testStatus: 'success'})
});
router.get('/testmail', function(req, res) {
    if (config.testEmailEnabled) {
        mailer.sendTestMail();
        res.json({
            message: 'testmail sent!'
        });
    } else {
        res.json({
            message: 'Test disabled; testEmailEnabled: false'
        });
    }

});
router.get('/testmailhtml', function(req, res) {
    if (config.testEmailEnabled) {
        mailer.sendTestMailHTML();
        res.json({
            message: 'testmail sent!'
        });
    } else {
        res.json({
            message: 'Test disabled; testEmailEnabled: false'
        });
    }

});

router.get('/testimageresize', function(req, res) {
    Jimp.read('public/test.jpg').
    then(function(img) {
        img.cover(256,256)
            .quality(90)
            .write('public/test-large.jpg');
        img.cover(64,64)
            .quality(90)
            .write('public/test-small.jpg');

        res.send('done')
    }).catch(function(err){
        res.send(err);
    })

});

module.exports = router;