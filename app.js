gDb = require('mongoose');

// Creating database connection
gDb.connect('mongodb://localhost/test');

gDb.connection.on('error', function(){
  console.error("Unable to connect to database.");
  process.exit();
});

  
/*
Load all models: '/models'
*/
var folder_cache = require('node-folder-memcache');
var models_folder = new folder_cache(path.join(__dirname, 'models'));
models_folder.getFiles().forEach(function(model_file){
  model_file.require();
});


/*
Boot application
*/

var gApp = require('express')();
var gServer = require('http').Server(gApp);
var gIo = require('socket.io')(gServer);

// Serving index
gApp.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


// Websockets
var gClients = {};

gIo.on('connection', function (socket) {

  gClients[socket.id] = {};
  socket.emit('client.control', {type: 'client-connect', status: true});

  // Registers handlers for 'server.request' socket events
  require("./events/request")(socket);


});

gServer.listen(80);

