/*
	RoomHandler - organizes sockets in rooms based on pages being accessed in the browser.
*/

function RoomHandler(){

	/*
		All server rooms in the format:

		{
			'room_name': 
				{
					'socket_id': socket,
					...
				},
			...
		}

	*/
	this.rooms = {};
}


/*
	Broadcasts data to sockets defined by the filter. A client socket
	will not receive a broadcast more than once.
	
	@param object data
	@param array filters - Format:
	[
		{
			location: <location_name>,
			fn: <function> (Optional). Has to return 'boolean'. Takes args:
				- User | null

		},
		...
	]
*/
RoomHandler.prototype.broadcast = function(data, filters){
	var scope = this;

	// Collecting all users
	var target_sockets = [];

	filters.forEach(function(filter, index){

		if(scope.rooms[filter.location]){

			// Add all room members if no function given
			if(!filter.fn){

				scope.forEachSocket(filter.location, function(socket, user){

					// Only add once
					var found = false;
					target_sockets.forEach(function(test_socket){
						if(test_socket.id === socket.id)
							found = true;
					});
					if(!found)
						target_sockets.push(socket);

				});

			// Execute input function
			} else {

				scope.forEachSocket(filter.location, function(socket, user){

					// Check input function
					var input_fn = filter.fn(user);

					// Only add once
					var found = false;
					target_sockets.forEach(function(test_socket){
						if(test_socket.id === socket.id)
							found = true;
					});
					if(!found)
						target_sockets.push(socket);

				});

			}

		}

	});

	// Sending data to selected users
	target_sockets.forEach(function(socket, index){
		socket.emit('client.broadcast', data);
	});

}


RoomHandler.prototype.addSocket = function(room, socket)  {
	if(typeof room === 'string'){
		if(this.rooms[room]){
			this.rooms[room][socket.id] = socket;
		} else {
			this.rooms[room] = {};
			this.rooms[room][socket.id] = socket;
		}
	}
}

RoomHandler.prototype.removeSocket = function(room, socket)  {
	if(room && this.rooms[room]){
		delete this.rooms[room][socket.id];
	}
}

RoomHandler.prototype.summary = function(){
	console.log('');
	console.log('===========================');
	console.log('==== SERVER ROOM COUNTS ===');
	console.log('===========================');

	for(var room_name in this.rooms){

		var count = 0;
		for (var k in this.rooms[room_name]) {
		    if (this.rooms[room_name].hasOwnProperty(k)) {
		       count++;
		    }
		}

		console.log(room_name + ": " + count);
	}
	console.log('');
	console.log('');
}


/*
	Iterates through all sockets of a room

	@param string room
	@param function iterator - 	Take as arguments:
								socket
								user | null
*/
RoomHandler.prototype.forEachSocket = function(room, iterator) {
	if(this.rooms[room]){
		for(var index in this.rooms[room]){
			var socket = this.rooms[room][index];
			var user = gSessions.clientSessions[socket.id].getLoggedUser();

			// Execute function
			iterator(socket, user);
		}
	}
}

module.exports = RoomHandler;