const express = require('express');
const router = express.Router();


/* GET home page. */
router.get('/', function(req, res) {
	res.send({
		message: 'Welcome to Industrial Training Portal!'
	})

});

module.exports = router;