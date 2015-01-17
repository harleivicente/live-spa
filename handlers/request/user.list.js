/*
SERVER REQUEST API

user.list
	Lists all users

@reply users array - Array of USER

@permission - logged as root user


*/
module.exports = function(params, callback, session){
	var User = gDb.model('User');

	/*
		Permission check
	*/
	var clear = false;
	var loggedUser = session.getLoggedUser();
	if(loggedUser && loggedUser.isRoot()){
		clear = true;
	}

	if(clear){
		User.find(function(error, users){
			if(error){
				callback(false);
			} else {
				callback(true, {users: users});
			}
		});
	} else {
		callback(false);
	}
};