describe("image.list.collection",function(){
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


	it("Can't list images of collection that does not exist.", function(done){

		async.series({
			
			// Attempt to edit collection
			package: function(ready){
				testApiRequest(client_a, 'image.list.collection', {
					collectionId: null
				}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('image.list.collection');
			result.package.should.have.property('error');
			result.package.error.should.equal('generic');
			done();
		});

	});


	it("Regular user can't list images of private collection owned by another user.", function(done){

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

		// Attempt to fetch
		function(errors, result){

			// create image a
			makeApiRequest(client_a, 'image.create', {
				title: 'Image will fail 2',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'
			}, function(error, image_pkg){

				// create image b
				makeApiRequest(client_a, 'image.create', {
					title: 'some image b',
					collection_id: result.collection.data.collection._id,
					image_file_url: 'url goes here 23'
				}, function(error, image_b_pkg){

					// Regular b login
					makeApiRequest(client_a, 'user.login', {
						username: regular_b.username,
						password: 'api.test'
					}, function(error, package){

						testApiRequest(client_a, 'image.list.collection', {
								collectionId: result.collection.data.collection._id
							},
							function(error, package){
								package.status.should.equal(false);
								package.type.should.equal('image.list.collection');
								package.should.have.property('error');
								package.error.should.equal('generic');
								done();
							}
						);	
					});
					
				});

			});		

		});

	});
	

	it("Regular user can list images of private collection owned by self.", function(done){

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

		// Attempt to fetch
		function(errors, result){

			// create image a
			makeApiRequest(client_a, 'image.create', {
				title: 'Image will fail 2',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'
			}, function(error, image_pkg){

				// create image b
				makeApiRequest(client_a, 'image.create', {
					title: 'some image b',
					collection_id: result.collection.data.collection._id,
					image_file_url: 'url goes here 23'
				}, function(error, image_b_pkg){

					testApiRequest(client_a, 'image.list.collection', {
							collectionId: result.collection.data.collection._id
						},
						function(error, package){
							package.status.should.equal(true);
							package.type.should.equal('image.list.collection');
							package.should.not.have.property('error');
							package.should.have.property('data');
							package.data.should.have.property('images');
							package.data.images.length.should.equal(2);
							done();
						}
					);	
				
				});

			});		

		});

	});

	it("Regular user can list images of public collection owned by another user.", function(done){

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
					privacy: 'public',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			}

		}, 

		// Attempt to fetch
		function(errors, result){

			// create image a
			makeApiRequest(client_a, 'image.create', {
				title: 'b',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'
			}, function(error, image_pkg){

				// create image b
				makeApiRequest(client_a, 'image.create', {
					title: 'a',
					collection_id: result.collection.data.collection._id,
					image_file_url: 'url goes here 23'
				}, function(error, image_b_pkg){

					// create image c
					makeApiRequest(client_a, 'image.create', {
						title: 'c',
						collection_id: result.collection.data.collection._id,
						image_file_url: 'url goes here 23'
					}, function(error, image_b_pkg){

						// Regular b login
						makeApiRequest(client_a, 'user.login', {
							username: regular_b.username,
							password: 'api.test'
						}, function(error, package){

							testApiRequest(client_a, 'image.list.collection', {
									collectionId: result.collection.data.collection._id
								},
								function(error, package){

									package.status.should.equal(true);
									package.type.should.equal('image.list.collection');
									package.should.not.have.property('error');
									package.should.have.property('data');
									package.data.should.have.property('images');
									package.data.images.length.should.equal(3);
									done();
								}
							);	
						});
						
					});

					
				});

			});		

		});

	});

});