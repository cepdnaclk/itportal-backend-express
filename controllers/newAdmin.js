const User = require('../models/user');
const Settings = require('../config');

module.exports = function(){


	console.log('Checking for existing admin accounts...')

	User.findOne({ role: { "$in" : ['ADMIN']}} , function(err, user){
		console.log(err, user)
		if(err) {
			console.error('something went wrong')
			return true;
		}
		if(user){
			console.log('admin already exists.. continuing.')
			return;
		}

		let admin = new User();
        admin.name = 'Default Administrator';
        admin.email = Settings.defaultAdminEmail;
        admin.password = admin.generateHash(Settings.defaultAdminPassword);
        admin.role = ['ADMIN'];

        admin.save(function(err, newuser){
            if(!err){
				console.log('New ADMIN account created with default settings')
                
            }
        })

	})


}