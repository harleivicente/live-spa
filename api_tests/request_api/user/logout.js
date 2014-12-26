describe("user.logout",function(){

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

	it("User will be logged out.", function(done){

		async.series({

			// Log in
			root: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: 'root',
					password: 'root'
				}, ready);
			},

			// Attempt logout
			package: function(ready){
				testApiRequest(client_a, 'user.logout', {}, ready);
			}

		}, 

		function(error, results){
			results.package.status.should.equal(true);
			results.package.type.should.equal('user.logout');
			results.package.status.should.not.have.property('error');

			makeApiRequest(client_a, 'user.isLogged', {}, function(error, package){
				package.data.logged.should.equal(false);
				done();
			});

		});

	});


});