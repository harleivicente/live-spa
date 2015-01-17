should = require('should');
socket_io = require('socket.io-client');
base_url = 'http://localhost';
async = require('async');

console.log('Testing Live SPA');


/*

Executes a server request. Expects a successful response.

@param Socket client
@param string type
@param Object options - as expected by api call
@param function callback 	- 	Expects arguments:
									error - null
									object - Data by client

@throw Error:Unsuccessful api request: <type> - If response has
status of false.

*/
makeApiRequest = function(client, type, options, callback){
	var random_id = Math.floor(Math.random() * 100000000000);

	client_a.on('client.response', function(package){
		if(package.id === random_id){
			if(package.status){
				callback(false, package);
			} else {
				throw new Error("Unsuccessful api request: " + type + ". " + package.error);				
			}
		}
	});

	client_a.emit('server.request', {
		type: type,
		id: random_id,
		params: options
	});
}

/*

Executes an server request.

@param Socket client
@param string type
@param Object options - as expected by api call
@param function callback 	- 	Expects arguments:
									error - null
									object - Data by client

*/
testApiRequest = function(client, type, options, callback){
	var random_id = Math.floor(Math.random() * 100000000000);

	client_a.on('client.response', function(package){
		if(package.id === random_id){
			callback(false, package);
		}
	});

	client_a.emit('server.request', {
		type: type,
		id: random_id,
		params: options
	});
}

