/*
SERVER REQUEST API

user.signup
	Create new account

@param string displayName
@param string email
@param string username
@param string password

@error username - username already in use
@error email - email already in use

*/
module.exports = function(params, callback){
	var User = gDb.model('User');
	var async = require("async");

	async.parallel({
		email: function(done){
			User.find({email: params.email}, function(error, users){
				done(error, users.length <= 0);				
			});
		},
		username: function(done){
			User.find({username: params.username}, function(error, users){
				done(error, users.length <= 0);				
			});
		}
	}, function(error, verified){

		// Database error ?
		if(error) {
			callback(false);

		// Email in use
		} else if(!verified.email) {
			callback(false, 'email');

		// Username in use
		} else if(!verified.username) {
			callback(false, 'username');

		// Attempt user creation
		} else {

			
			var options = {
				displayName: params.displayName,
				email: params.email,
				username: params.username,
				root: false
			};

			var user = new User(options);
			user.setPasswordHash(params.password);

			user.save(function(error){
				callback(!Boolean(error));
			});
		}


	});


};