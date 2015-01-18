module.exports = function(params, session){
	var new_location = params.code;
	
	if(typeof new_location === 'string'){
		var current_location = session.location;
		var socket = session.socket;

		gRooms.removeSocket(current_location, socket);
		session.location = new_location;
		gRooms.addSocket(new_location, socket);
	}

}