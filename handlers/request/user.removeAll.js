/*
SERVER REQUEST API

user.removeAll
	Remove all non-root users

@permission - Logged as root user

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
		User.find({root: {$ne: true}}, function(error, users){
			if(error){
				callback(false);
			} else if(users) {

				async.map(users,
					
					function(user, next){

						// Log user out
						if(gSessions.logUserOut(user)){

							// Broadcast logout
						}

						// Remove user
						user.remove(function(error, user){
							if(error){
								next(true);
							} else {

								// Broadcast user removal

								next(false);
							}
							
						});

					}, 
					function(error){
						callback(!Boolean(error));
					});

			} else {
				callback(true);
			}
		});

	} else {
		callback(false);
	}
};