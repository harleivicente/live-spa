/*
SERVER REQUEST API

user.login
	User logs into server

@param string username
@param string password

@error credentials - Either username or
password are incorrect.

@reply USER user - Logged user

*/
module.exports = function(params, callback, session){
	var User = gDb.model('User');
	User.findOne({username: params.username, passwordHash: params.password}, function(error, user){
		if(error){
			callback(false);	
		} else {
			if(user){

				session.logIn(user);
				callback(true, {user: session.getLoggedUser()});

			} else {
				callback(false, 'credentials');
			}
		}
	});
};