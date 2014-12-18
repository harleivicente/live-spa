/*
	Creating database connection
*/
	var mongoose = require('mongoose');
	gDb = mongoose;
	gDb.connect('mongodb://localhost/test');
	gDb.connection.on('error', function(){
	  console.error("Unable to connect to database.");
	  process.exit();
	});
	
/*
	Load all models(/models)
*/
	var folder_cache = require('node-folder-memcache');
	var models_folder = new folder_cache(path.join(__dirname, 'models'));
	models_folder.getFiles().forEach(function(model_file){
	  model_file.require();
	});


/*
	Create root user if it does not exist
*/
	var User = gDb.model('User');
	User.find({username: 'root'}, function(error, user){
		if(error){
			throw new Error("Unable to create root user during app startup.");
		}

		if(user.length === 0){
			var root = new User({
				displayName: 'root',
				username: 'root',
				passwordHash: 'root',
				email: 'root@email.com'
			});
			root.save(function(error){
				if(error){
					throw new Error("Unable to create root user during app startup.");
				}

			});
		}
	});


/*
	Creating Server session
*/
	var ServerSession = require('./lib/ServerSession');
	gSessions = new ServerSession; // ServerSession object, container for client session


/*
	Boot application
*/
	var app = require('express')();
	var server = require('http').Server(app);
	var io = require('socket.io')(server);

	// Serving index
	app.get('/', function (req, res) {
	  res.sendFile(__dirname + '/index.html');
	});

	// Websockets
	io.on('connection', function (socket) {
		console.log('Connect');

		// Destroy session if connection ends
	  	socket.on('disconnect', function(){
	  		console.log("Disconnect");
	  		gSessions.destroySession(socket);
	  	});

		// ClientSession, avaiable in api handlers
		session = gSessions.createSession(socket);

	  	// Registers handlers for 'server.request' socket events
	  	require("./lib/request_events_setup")(socket);
	});

	server.listen(80);

