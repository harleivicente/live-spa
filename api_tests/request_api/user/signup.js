describe("user.signup",function(){

	beforeEach(function(ready){
		var options = {
			transports: ['websocket'],
  			'force new connection': true
		};

		client_a = socket_io(base_url, options);
		ready();
	});

	afterEach(function(ready){
		client_a.disconnect();
		ready();
	});

	it("Will not allow an email in use to be registered.", function(done){

		client_a.on('client.response', function(package){
			package.id.should.equal(4);
			package.status.should.equal(false);
			package.type.should.equal('user.signup');
			package.error.should.equal('email');
			done();
		});

		client_a.emit('server.request', {
			type: 'user.signup',
			id: 4,
			params: {
				displayName: 'me',
				password: 'me',
				email: 'root@email.com',
				username: 'api.test.' + Math.random()
			}
		});
	});

	it("Will not allow an username in use to be registered.", function(done){

		client_a.on('client.response', function(package){
			package.id.should.equal(5);
			package.status.should.equal(false);
			package.type.should.equal('user.signup');
			package.error.should.equal('username');
			done();
		});

		client_a.emit('server.request', {
			type: 'user.signup',
			id: 5,
			params: {
				displayName: 'me',
				password: 'me',
				email: 'api.test.' + Math.random(),
				username: 'root'
			}
		});
	});

	it("Will allow user to signup when correct data is given.", function(done){

		client_a.on('client.response', function(package){
			package.id.should.equal(3);
			package.type.should.equal('user.signup');
			package.status.should.equal(true);
			package.should.not.have.property('error');
			done();
		});

		var seed = Math.random();

		client_a.emit('server.request', {
			type: 'user.signup',
			id: 3,
			params: {
				displayName: 'me',
				password: 'me',
				email: 'api.test.' + seed,
				username: 'api.test.' + seed
			}
		});

	});


});