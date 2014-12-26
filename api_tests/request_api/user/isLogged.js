describe("user.isLogged",function(){

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

	it("Detects that user is not logged in.", function(done){

		async.series({

			// Verifies status
			package: function(ready){
				testApiRequest(client_a, 'user.isLogged', null, ready);
			}

		}, 

		function(error, results){
			results.package.status.should.equal(true);
			results.package.type.should.equal('user.isLogged');
			results.package.should.not.have.property('error');
			results.package.should.have.property('data');
			results.package.data.should.have.property('logged');
			results.package.data.logged.should.equal(false);
			done();
		});

	});

	it("Detects that user is logged in.", function(done){

		async.series({

			// Log in
			root: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: 'root',
					password: 'root'
				}, ready);
			},

			// Verifies
			package: function(ready){
				testApiRequest(client_a, 'user.isLogged', null, ready);
			}

		}, 

		function(error, results){
			results.package.status.should.equal(true);
			results.package.type.should.equal('user.isLogged');
			results.package.should.not.have.property('error');
			results.package.should.have.property('data');
			results.package.data.should.have.property('logged');
			results.package.data.logged.should.equal(true);
			done();
		});


	it("Detects that user is logged out after initial login.", function(done){

		async.series({

			// Log in
			root: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: 'root',
					password: 'root'
				}, ready);
			},

			// Log out
			root: function(ready){
				makeApiRequest(client_a, 'user.logout', null, ready);
			},

			// Verifies
			package: function(ready){
				testApiRequest(client_a, 'user.isLogged', null, ready);
			}

		}, 

		function(error, results){
			results.package.status.should.equal(true);
			results.package.type.should.equal('user.isLogged');
			results.package.should.not.have.property('error');
			results.package.should.have.property('data');
			results.package.data.should.have.property('logged');
			results.package.data.logged.should.equal(false);
			done();
		});

	});

	});


});