/*

Server session for websocket clients. Holds state data for all
clients. Provides functionality to create, manipulate and destroy
client sessions.

@see lib/ClientSession.js

@usage - To use module:
	var ServerSession = require(...);
	var serverSession = new ServerSession();
	serverSession.createSession(...);

*/
function ServerSession(){
	this.clients = {};
}

/*
Creates new session.

@param string sessionId

@return ClientSession|false - 	False if no sessionId is 
								given or is already in use.

*/
ServerSession.prototype.createSession = function(sessionId){
	var output = null;

	if(typeof sessionId === 'string'){
		if(this.clients.hasOwnProperty(sessionId)){
			output = false;
		} else {
			this.clients[sessionId] = new ClientSession(sessionId);
			output = this.clients[sessionId];
		}
	} else {
		output = false;
	}

	return output;
}

/*
Destroys client session

@param string sessionId

*/
ServerSession.prototype.destroySession = function(sessionId){
	if(this.clients.hasOwnProperty(sessionId)){
		delete this.clients[sessionId];
	}
}

/*
Obtains client session

@param string sessionId

@return ClientSession|false
*/
ServerSession.prototype.getSession = function(sessionId){
	var output = null;

	if(this.clients.hasOwnProperty(sessionId)){
		output = this.clients[sessionId];
	} else {
		output = false;
	}

	return output;
}

var ClientSession = require('./ClientSession.js');
module.exports = ServerSession;