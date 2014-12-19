describe("user.removeAll",function(){
	var regular_a = null;
	var regular_b = null;

	// Creates 2 regular users
	beforeEach(function(before_ready){
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


	afterEach(function(ready){
		client_a.disconnect();
		ready();
	});


	it("If root logged in, added regular users are moved.", function(done){

		async.series({
			
			// Log is as root
			root_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: 'root',
					password: 'root'
				}, ready);
			},

			// Attempt to remove all
			package: function(ready){
				testApiRequest(client_a, 'user.removeAll', null, ready);
			},

			// Fetch all users
			users_package: function(ready){
				makeApiRequest(client_a, 'user.list', null, ready)
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(true);
			result.package.type.should.equal('user.removeAll');
			result.package.should.not.have.property('error');

			// check that regular users created have been removed
			var found = false;
			result.users_package.data.users.forEach(function(user){
				if 	(user.username === regular_a.username ||
					user.username === regular_b.username) {
					found = true;
				}
			});
			found.should.equal(false);
			done();
		});

	});

});