/*

Server session for one websocket client.

@param string sessionId

@throws Error:Invalid session id given
*/
function ClientSession(sessionId){
	if(typeof sessionId !== "number" &&
	typeof sessionId !== "string"){
		throw new Error("Invalid session id given");
	}

	this.sessionId = sessionId;
	this.loggedUser = null;
}

/*

Logs out user if one exists

*/
ClientSession.prototype.logOut = function(){
	this.loggedUser = null;
}


/*

Obtais logged user if exists

@return User|null
*/
ClientSession.prototype.getLoggedUser = function(){
	return this.loggedUser ? this.loggedUser : null;
}

/*
Logs in user.

@params User user

@throws Error:Invalid User given as paramater
*/
ClientSession.prototype.logIn = function(user){
	if(user instanceof User){

		// Log user out if needed
		if(this.getLoggedUser()){
			this.logOut();
		}
		this.loggedUser = user;
	} else {
		throw new Error('Invalid User given as paramater');
	}
}

var User = gDb.model('User');
module.exports = ClientSession;