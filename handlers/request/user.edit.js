/*
SERVER REQUEST API

user.edit
	Change user data

@param string userId
@param string displayName (Optional)
@param string email (Optional)
@param string password (Optional)

@reply User user - User entity after edit

@permission - Root user or logged as user being edited

@broadcast
	- name: 'user'
	- target: 	logged as root and at 'admin:users' ||
				logged as user being edited
	- data: {
		user: USER,
		author: USER,
		action: 'edit',
		attributesAffected: <array of attr. names>
	}

*/
module.exports = function(params, callback){
	var User = gDb.model('User');
	
	User.findById(params.userId, function(error, user){
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

				// Set properties
				if(params.displayName)
					user.displayName = params.displayName;
				if(params.email)
					user.email = params.email;
				if(params.password)
					user.setPasswordHash(params.password);

				// Save in database
				user.save(function(error){
					if(error){
						callback(false);
					} else {
						callback(true, {user: user})
					}
				});

			} else {
				callback(false);
			}
		}
	});

};