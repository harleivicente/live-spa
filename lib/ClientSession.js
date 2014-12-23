/*

Server session for one websocket client.

@param Socket socket
@param ServerSession serverSession

@throws Error:Invalid Session given
*/
function ClientSession(socket, serverSession){
	if(socket === undefined ||
	socket === null){
		throw new Error("Invalid session id given");
	}

	/*
		ServerSession in which ClientSession is contained
	*/
	this.serverSession = serverSession;

	/*
		Socket for client
	*/
	this.socket = socket;

	/*
		User client is logged as
	*/
	this.loggedUser = null;
}

/*
Logs out user if one exists

*/
ClientSession.prototype.logOut = function(){
	if(this.getLoggedUser()){
		this.serverSession.logUserOut(this.getLoggedUser());
	}
}

/*
Logs in user.

@params User user

*/
ClientSession.prototype.logIn = function(user){
	this.logOut();
	this.serverSession.logUser(this.socket, user);
}

/*

Obtais logged user if exists

@return User|null
*/
ClientSession.prototype.getLoggedUser = function(){
	return this.loggedUser ? this.loggedUser : null;
}


var User = gDb.model('User');
module.exports = ClientSession;