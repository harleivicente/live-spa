describe("collection.create",function(){
	var regular_a = null;

	// Creates 1 regular users
	beforeEach(function(before_ready){
		var seeds = [Math.random()];

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
				}
			],
			function(error, results){
				regular_a = results[0].data.user;
				before_ready();
			}
		);
	});



	afterEach(function(ready){
		client_a.disconnect();
		ready();
	});


	it("Can't create collection if logged out.", function(done){

		async.series({
			
			// Attempt to create
			package: function(ready){
				testApiRequest(client_a, 'collection.create', {
					title: 'Tundra',
					description: 'Very cold place',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('collection.create');
			result.package.should.have.property('error');
			result.package.error.should.equal('generic');
			done();
		});

	});


	it("When logged collection is created and belongs to logged user.", function(done){

		async.series({

			// Log is as regular
			regular_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Create
			package: function(ready){
				testApiRequest(client_a, 'collection.create', {
					title: 'Tundra',
					description: 'Very cold place',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(true);
			result.package.type.should.equal('collection.create');
			result.package.should.not.have.property('error');
			result.package.should.have.property('data');
			result.package.data.should.have.property('collection');
			result.package.data.collection.should.have.properties({
				title: 'Tundra',
				owner_id: regular_a._id
			});
			done();
		});

	});



});