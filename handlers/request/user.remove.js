/*
SERVER REQUEST API

user.remove
	Log user out. Remove user account. Data related to user will be removed.

@param string userId

@permission - Logged as user being removed or root user


*/
module.exports = function(params, callback){
	var User = gDb.model('User');

	User.findById(params.userId, function(error, user){

		// User does not exist
		if(error){
			callback(false);
		} else {

			/*
				Permission check
			*/
			var loggedUser = session.getLoggedUser();
			var cleared = false;
			if(!loggedUser){
				cleared = false;
			} else if(loggedUser.isRoot()) {
				cleared = true;
			} else if(loggedUser.getId() === params.userId){
				cleared = true;
			}

			if(cleared){
				
				// Log user out
				if(gSessions.logUserOut(user)){

					// Broadcast logout
				}

				// Remove user
				user.remove(function(error, user){

					// Broadcast user removal
					
					callback(!Boolean(error));
				});

			} else {
				callback(false);
			}
		}

	});
};