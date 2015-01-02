describe("image.remove",function(){
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


	it("Can't remove image that does not exist.", function(done){

		async.series({
			
			// Attempt to remove image
			package: function(ready){
				testApiRequest(client_a, 'image.remove', {
					imageId: null
				}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('image.remove');
			result.package.should.have.property('error');
			result.package.error.should.equal('generic');
			done();
		});

	});


	it("Regular user can't remove image of collection owned by another user.", function(done){

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
			}

		}, 

		// Attempt to remove
		function(errors, result){

			// create image
			makeApiRequest(client_a, 'image.create', {
				title: 'Image will fail 2584',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'
			}, function(error, image_pkg){

				// Regular b login
				makeApiRequest(client_a, 'user.login', {
					username: regular_b.username,
					password: 'api.test'
				}, function(error, package){

					testApiRequest(client_a, 'image.remove', {
							imageId: image_pkg.data.image._id
						},
						function(error, package){
							package.status.should.equal(false);
							package.type.should.equal('image.remove');
							package.should.have.property('error');
							package.error.should.equal('generic');
							done();
						}
					);	
					
				});

			});	
		});

	});



	it("Regular user can remove image of collection owned by self.", function(done){

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
			}

		}, 

		// Attempt to remove
		function(errors, result){

			// create image
			makeApiRequest(client_a, 'image.create', {
				title: 'Image will fail 2584',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'
			}, function(error, image_pkg){

				testApiRequest(client_a, 'image.remove', {
						imageId: image_pkg.data.image._id
					},
					function(error, package){
						package.status.should.equal(true);
						package.type.should.equal('image.remove');
						package.should.not.have.property('error');
						done();
					}
				);	
					

			});	
		});

	});

});