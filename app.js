var gFs = require('fs');
var gPath = require('path');
var gApp = require('express')();
var gServer = require('http').Server(gApp);
var gIo = require('socket.io')(gServer);
var gFolder_memcache = require("node-folder-memcache");
gServer.listen(80);


new gFolder_memcache(gPath.join(__dirname, 'socket_events')).eachFolder(function(p, f, n){
  console.log(p);
  n();
});

// Serving index
gApp.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// Websockets
var client_state = {};

gIo.on('connection', function (socket) {


  client_state[socket.id] = {};
  socket.emit('client-control', {type: 'client-connect', status: true});

  socket.on('server.request', function(package){

    // signup
    if(package.type === 'user.signup'){
      // make user
      socket.emit('client.reply', {
        type: package.type,
        id: package.id,
        status: true
      });
    }
    

  });

});

