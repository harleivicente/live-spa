describe("collection.edit",function(){
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


	it("Can't edit collection that does not exist.", function(done){

		async.series({
			
			// Attempt to edit collection
			package: function(ready){
				testApiRequest(client_a, 'collection.edit', {
					collectionId: null
				}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('collection.edit');
			result.package.should.have.property('error');
			result.package.error.should.equal('generic');
			done();
		});

	});


	it("Regular user can't edit collection owned by another user.", function(done){

		async.series({

			// Log is as regular A
			regular_a_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Create
			collection: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'Tundra 2',
					description: 'Very cold place 2',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			},

			// Log is as regular B
			regular_b_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_b.username,
					password: 'api.test'
				}, ready);
			},			

		}, 

		// Attempt to fetch
		function(errors, result){


			testApiRequest(client_a, 'collection.edit', {
					collectionId: result.collection.data.collection._id,
					title: 'new title'
				},
				function(error, package){
					package.status.should.equal(false);
					package.type.should.equal('collection.edit');
					package.should.have.property('error');
					package.error.should.equal('generic');
					done();
				}
			);	

		});

	});


	it("Regular user can edit own collection.", function(done){

		async.series({

			// Log is as regular A
			regular_a_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Create
			collection: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'Some ice work',
					description: 'Very cold place 2',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			}

		}, 
		
		// Attempt to edit
		function(errors, result){


			testApiRequest(client_a, 'collection.edit', {
					collectionId: result.collection.data.collection._id,
					title: 'new title',
					privacy: 'public'
				},
				function(error, package){
					package.status.should.equal(true);
					package.type.should.equal('collection.edit');
					package.should.not.have.property('error');
					package.should.have.property('data');
					package.data.should.have.property('collection');
					package.data.collection.should.have.properties({
						title: 'new title',
						description: 'Very cold place 2',
						privacy: 'public',
						owner_id: regular_a._id
					});
					done();
				}
			);	

		});

	});

});