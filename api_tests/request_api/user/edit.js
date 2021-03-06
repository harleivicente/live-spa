describe("user.edit",function(){
	var regular_a = null;
	var regular_b = null;

	// Creates 2 regular users
	before(function(before_ready){
		var seeds = [Math.random(), Math.random()];

		var options = {
			transports: ['websocket'],
				'force new connection': true
		};
		client_a = socket_io(base_url, options);

		async.parallel([
				function(ready){
					makeApiRequest(client_a, 'user.signup', {
						displayName: 'api.test', password: 'api.test',
						email: 'api.test.' + seeds[0],
						username: 'api.test.' + seeds[0]							
					}, ready);
				},
				function(ready){
					makeApiRequest(client_a, 'user.signup', {
						displayName: 'api.test', password: 'api.test',
						email: 'api.test.' + seeds[1],
						username: 'api.test.' + seeds[1]							
					}, ready);
				}
			],
			function(error, results){
				regular_a = results[0].data.user;
				regular_b = results[1].data.user;
				before_ready();
			}
		);
	});


	after(function(ready){
		client_a.disconnect();
		ready();
	});


	it("Root can edit regular user.", function(done){

		async.series({
			
			// Log is as root
			root_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: 'root',
					password: 'root'
				}, ready);
			},

			// Attempt to edit
			package: function(ready){
				testApiRequest(client_a, 'user.edit', {
					userId: regular_a._id,
					email: "new@email.com"
				}, ready);
			}			

		}, 

		// Atempt to edit
		function(errors, result){
			result.package.status.should.equal(true);
			result.package.type.should.equal('user.edit');
			result.package.should.not.have.property('error');
			result.package.should.have.property('data');
			result.package.data.should.have.property('user');
			result.package.data.user.should.have.properties({
				_id: regular_a._id,
				email: "new@email.com",
				username: regular_a.username
			});
			done();
		});

	});
	

	it("Regular user can edit self.", function(done){

		async.series({
			
			// Log is as regular
			regular_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Attempt to edit
			package: function(ready){
				testApiRequest(client_a, 'user.edit', {
					userId: regular_a._id,
					email: "new@email.com"
				}, ready);
			}			

		}, 

		// Atempt to edit
		function(errors, result){
			result.package.status.should.equal(true);
			result.package.type.should.equal('user.edit');
			result.package.should.not.have.property('error');
			result.package.should.have.property('data');
			result.package.data.should.have.property('user');
			result.package.data.user.should.have.properties({
				_id: regular_a._id,
				email: "new@email.com",
				username: regular_a.username
			});
			done();
		});

	});

	it("Regular user cannot edit another.", function(done){

		async.series({
			
			// Log is as regular
			regular_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Attempt to edit other regular user
			package: function(ready){
				testApiRequest(client_a, 'user.edit', {
					userId: regular_b._id,
					email: "new@email.com"
				}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('user.edit');
			result.package.should.have.property('error');
			result.package.error.should.equal('generic');
			result.package.should.not.have.property('data');
			done();
		});

	});

});