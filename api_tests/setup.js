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


	client.on('client.response', function(package){

		if(package.id === random_id){
			callback(false, package);
		}
	});

	client.emit('server.request', {
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

/*
	Verifies that correct clients receive broadcasts. Timeout for check is 1 second.

	@param object content - Object that is expected in the broadcast
	@param array targets - 	Array of client sockets that must receive 
							the data
	@param array non_targets - 	Array of client sockets that must not receive
								the data
	@param function callback - Function to call if the check is successful

	@throws Error if unsuccessful

*/
checkBroadcast = function(content, targets, non_targets, callback) {
	var timeout = 1000;
	var expected_receiver_indexes = [];
	var unexpected_receiver_indexes = [];

	var checkContent = function(content, package){
		var data_check = true;
		type_check = package.type === content.type;
		for(var i in content.data){
			if(content.data[i] !== package.data[i])
				data_check = false;
		}

		return type_check && data_check;
	}

	targets.forEach(function(client, index){
		client.on('client.broadcast', function(package){
			if(checkContent(content, package)){
				expected_receiver_indexes.push(index);
			}
		});
	});

	non_targets.forEach(function(client, index){
		client.on('client.broadcast', function(package){
			if(checkContent(content, package)){
				unexpected_receiver_indexes.push(index);
			}
		});
	});

	setTimeout(function(){
		if(targets.length !== expected_receiver_indexes.length || unexpected_receiver_indexes.length > 0) {
			throw new Error(
				"Broadcast check failed. Indexes of clients that got the broadcast: " +
				expected_receiver_indexes.toString() +
				". Indexes of clients that got the broadcast but should not have: " +
				unexpected_receiver_indexes.toString()
			);

		}

		callback();
	}, timeout);
}


