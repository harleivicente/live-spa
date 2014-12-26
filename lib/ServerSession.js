/*

Server session for websocket clients. Holds client sessions and
and associated socket for a logged user.

@see lib/ClientSession.js

*/
function ServerSession(){

	/*
		All logged users and the associated socket
			{
				<user_id>: <Socket>,
				...
			}
	*/
	this.loggedUsers = {};

	/*
		Session data for each connected client
			{
				<socket.id>: <ClientSession>,
				...
			}
	*/
	this.clientSessions = {};
}

/*
Logs an User in the server and associates a Socket.

@param Socket socket
@param User user

@throw Error:Could not locate ClientSession for Socket
*/
ServerSession.prototype.logUser = function(socket, user){
	this.loggedUsers[user.getId()] = socket;
	
	if(this.clientSessions.hasOwnProperty(socket.id)){
		this.clientSessions[socket.id].loggedUser = user;
	} else {
		throw new Error("Could not locate ClientSession for Socket");
	}
};

/*
Logs user out from server.

@param User user

@return boolean - if there was a logged user or not
*/
ServerSession.prototype.logUserOut = function(user){
	if(this.loggedUsers.hasOwnProperty(user.getId())){
		var loggedUserSocket = this.getLoggedUserSocket(user);

		if(this.clientSessions.hasOwnProperty(loggedUserSocket.id)){
			this.clientSessions[loggedUserSocket.id].loggedUser = null;
		} else {
			throw new Error("Could not locate ClientSession for Socket");
		}

		delete this.loggedUsers[user.getId()];
		return true;
	} else {
		return false;
	}
};

/*
Obtains Socket of a logged user.

@param User user

@return Socket|false 			- 	Socket or false if such user
									is not logged
*/
ServerSession.prototype.getLoggedUserSocket = function (user){
	if(this.loggedUsers.hasOwnProperty(user.getId())){
		return this.loggedUsers[user.getId()];
	} else {
		return false;
	}
}


/*
Creates new session.

@param Socket socket

@return ClientSession

*/
ServerSession.prototype.createSession = function(socket){
	var output = null;
	this.clientSessions[socket.id] = new ClientSession(socket, this);
	output = this.clientSessions[socket.id];
	return output;
}

/*
Destroys client session. Logs out user in client.

@param Socket socket

*/
ServerSession.prototype.destroySession = function(socket){
	if(this.clientSessions.hasOwnProperty(socket.id)){
		this.clientSessions[socket.id].logOut();
		delete this.clientSessions[socket.id];
	}
}

var ClientSession = require('./ClientSession.js');
module.exports = ServerSession;