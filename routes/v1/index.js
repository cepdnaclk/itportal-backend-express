const express = require('express');
const router = express.Router();


/*
	 d888b  d88888b d888888b
	88' Y8b 88'     `~~88~~'
	88      88ooooo    88
	88  ooo 88~~~~~    88
	88. ~8~ 88.        88
	 Y888P  Y88888P    YP
	
	
*/

router.get('/', function(req, res){
	res.send('welcome to v1 api!');
})

router.get('/user', function(req, res){
	res.send('Current user :P');
})

module.exports = router;