var gApp = require('express')();
var gServer = require('http').Server(gApp);
var gIo = require('socket.io')(gServer);
gServer.listen(80);

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

