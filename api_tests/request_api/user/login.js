describe("user.login",function(){

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

	it("When provided with correct credentials of a registered user, it is possible to log in.", function(done){

		client_a.on('client.response', function(package){
			package.id.should.equal(1);
			package.status.should.equal(true);
			package.type.should.equal('user.login');
			package.data.user.should.have.properties({
			    username: 'root',
			    email: 'root@email.com'
			});
			done();
		});

		client_a.emit('server.request', {
			type: 'user.login',
			id: 1,
			params: {
				username: 'root',
				password: 'root'
			}
		});
	});

	it("When provided with incorrect credentials we get an error of type 'credentials'", function(done){

		client_a.on('client.response', function(package){
			package.id.should.equal(2);
			package.status.should.equal(false);
			package.type.should.equal('user.login');
			package.should.not.have.property('data');
			package.error.should.equal('credentials');
			done();
		});

		client_a.emit('server.request', {
			type: 'user.login',
			id: 2,
			params: {
				username: 'root',
				password: 'wrongpassword'
			}
		});
	});


});