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

	client.on('client.response', function(package){
		if(package.id === random_id){
			if(package.status){
				callback(false, package);
			} else {
				throw new Error("Unsuccessful api request: " + type + ". " + package.error);				
			}
		}
	});

	client.emit('server.request', {
		type: type,
		id: random_id,
		params: options
	});
}


/*
	Sends 'location'  in the system to the server

	@param location
*/
sendLocation = function(client, location){
	client.emit('server.control', {
		type: 'location',
		params: {
			code: location
		}
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


/*

Creates users

@param array of Socket sockets - Sockets to use to create users. One user per
client.

@param function callback - 	Function that will take the args:
								- array users - Format:
									[
										{username: <>, password: <>, user: <User>},
										...
									]

@throws Exception in case of any error

*/
createUsers = function(sockets, callback){
	var output_users = [];

	async.times(
		sockets.length,

		function(iteration, next){
			var random_id = Math.floor(Math.random() * 100000000000);

			output_users.push({username: '_fk_username_' + random_id, password: '_fk_pass_' + random_id});

			makeApiRequest(sockets[iteration], 'user.signup', {
				displayName: '_fk_display_' + random_id,
				password: '_fk_pass_' + random_id,
				email: '_fk_email_' + random_id,
				username: '_fk_username_' + random_id
			}, next);

		},

		function(error, pkgs){

			pkgs.forEach(function(pkg, index){
				output_users[index].user = pkg.data.user;
			});

			callback(output_users);
		}
	);
}


/*
Creates socket clients

@param int n_of_clients - Number of clients to create

@return array of Sockets

*/
createClients = function(n_of_clients){
	var output = [];

	var options = {
		transports: ['websocket'],
		'force new connection': true
	};

	for (var i = n_of_clients; i >= 1; i--) {
		output.push(socket_io(base_url, options));
	};

	return output;
}

