describe("image.image",function(){
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


	it("Can't obtain image that does not exist.", function(done){

		async.series({
			
			// Attempt to fetch collection
			package: function(ready){
				testApiRequest(client_a, 'image.image', {
					imageId: null
				}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('image.image');
			result.package.should.have.property('error');
			result.package.error.should.equal('generic');
			done();
		});

	});


	it("Regular user can't fetch image of private collection owned by another user.", function(done){

		async.series({

			// Log is as regular A
			regular_a_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Create collection
			collection: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'Tundra 2',
					description: 'Very cold place 2',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			}
		}, 

		function(errors, result){

			// Create image
			makeApiRequest(client_a, 'image.create', {
				title: 'Image will fail',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'
			}, function(error, image_pkg){

				// Login as user B
				makeApiRequest(client_a, 'user.login', {
					username: regular_b.username,
					password: 'api.test'
				}, function(error, package){

					testApiRequest(client_a, 'image.image', {
						imageId: image_pkg.data.image._id
					}, function(error, package){

						package.status.should.equal(false);
						package.type.should.equal('image.image');
						package.should.have.property('error');
						package.error.should.equal('private');
						done();

					});	


				});


			});

		});

	});


	it("Regular user can fetch image of public collection owned by another user.", function(done){

		async.series({

			// Log is as regular A
			regular_a_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Create collection
			collection: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'Tundra 2',
					description: 'Very cold place 2',
					privacy: 'public',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			}
		}, 

		function(errors, result){

			// Create image
			makeApiRequest(client_a, 'image.create', {
				title: 'Dbj nat adr',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'
			}, function(error, image_pkg){

				// Login as user B
				makeApiRequest(client_a, 'user.login', {
					username: regular_b.username,
					password: 'api.test'
				}, function(error, package){

					testApiRequest(client_a, 'image.image', {
						imageId: image_pkg.data.image._id
					}, function(error, package){

						package.status.should.equal(true);
						package.type.should.equal('image.image');
						package.should.not.have.property('error');
						package.should.have.property('data');
						package.data.should.have.property('image');
						package.data.image.should.have.properties({
							title: 'Dbj nat adr',
							_id: image_pkg.data.image._id
						});
						done();

					});	


				});


			});

		});

	});


	it("Regular user can fetch image of private collection owned by self.", function(done){

		async.series({

			// Log is as regular A
			regular_a_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Create collection
			collection: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'Tundra 2',
					description: 'Very cold place 2',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			}
		}, 

		function(errors, result){

			// Create image
			makeApiRequest(client_a, 'image.create', {
				title: 'What is this ?!',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'
			}, function(error, image_pkg){

				testApiRequest(client_a, 'image.image', {
					imageId: image_pkg.data.image._id
				}, function(error, package){

					package.status.should.equal(true);
					package.type.should.equal('image.image');
					package.should.not.have.property('error');
					package.should.have.property('data');
					package.data.should.have.property('image');
					package.data.image.should.have.properties({
						title: 'What is this ?!',
						_id: image_pkg.data.image._id
					});
					done();

				});	

			});

		});

	});



});