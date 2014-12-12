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
	var gClients = {};

	io.on('connection', function (socket) {

		// ClientSession, avaiable in api handlers
		session = gSessions.createSession(socket.id);

	  	// Registers handlers for 'server.request' socket events
	  	require("./lib/request_events_setup")(socket);

	});

	server.listen(80);

