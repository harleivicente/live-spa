describe("collection.remove",function(){
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


	it("Can't remove collection that does not exist.", function(done){

		async.series({
			
			// Attempt to remove collection
			package: function(ready){
				testApiRequest(client_a, 'collection.remove', {
					collectionId: null
				}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('collection.remove');
			result.package.should.have.property('error');
			result.package.error.should.equal('generic');
			done();
		});

	});


	it("Regular user can't remove collection owned by another user.", function(done){

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

		// Attempt to remove
		function(errors, result){


			testApiRequest(client_a, 'collection.remove', {
					collectionId: result.collection.data.collection._id
				},
				function(error, package){
					package.status.should.equal(false);
					package.type.should.equal('collection.remove');
					package.should.have.property('error');
					package.error.should.equal('generic');
					done();
				}
			);	

		});

	});


	it("Regular user can remove own collection.", function(done){

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
		
		// Attempt to remove
		function(errors, result){
			testApiRequest(client_a, 'collection.remove', {
					collectionId: result.collection.data.collection._id
				},
				function(error, package){
					package.status.should.equal(true);
					package.type.should.equal('collection.remove');
					package.should.not.have.property('error');

					testApiRequest(client_a, 'collection.collection', {
						collectionId: result.collection.data.collection._id
					}, 
					function(error, package){
						package.status.should.equal(false);
						package.type.should.equal('collection.collection');
						package.should.have.property('error');
						package.error.should.equal('generic');
						done();
					});

				}
			);	

		});

	});


	it("When collection is removed, unable to access image that belonged to it.", function(done){

		async.waterfall([

			// Log is as regular A
			function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Create collection A
			function(login_pkg, ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'adriane',
					description: 'Very cold place 2',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			},

			// Create image A
			function(collection_pkg, ready){
				makeApiRequest(client_a, 'image.create', {
					title: 'adriane',
					collection_id: collection_pkg.data.collection._id,
					image_file_url: 'some_url.jpeg'
				}, ready);			
			},

			// Attempting collection removal
			function(image_pkg, ready){
				testApiRequest(client_a, 'collection.remove', {
					collectionId: image_pkg.data.image.collection_id
				}, function(error, package){
					ready(error, package, image_pkg.data.image._id);
				});			
			}
		], 
		
		// Check results
		function(error, collection_removal_pkg, image_id){

			// removal was successful
			collection_removal_pkg.status.should.equal(true, 'Unable to remove collection.');
			collection_removal_pkg.type.should.equal('collection.remove');
			collection_removal_pkg.should.not.have.property('error');

			// image was removed
			testApiRequest(
				client_a, 'image.image',
				{ imageId: image_id }, 
				function(error, package){
					package.status.should.equal(false, 'Image of deleted colletion might not have been deleted.');
					package.type.should.equal('image.image');
					package.should.have.property('error');
					package.error.should.equal('generic');
					done();
			});

		});	

	});

});