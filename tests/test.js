var should = require('should');
var socket_io = require('socket.io-client');
var base_url = 'http://localhost:80';

describe("Livespa",function(){

	it("Should inform client that connection has been established with client-connect", function(done){
		var socket = socket_io(base_url);
		socket.on('client-control', function(package){
			package.type.should.equal('client-connect');
			package.status.should.equal(true);
			done();
		})
	});

	


});