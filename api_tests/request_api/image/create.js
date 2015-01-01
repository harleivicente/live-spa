describe("image.create",function(){
	var regular_a = null;
	var regular_b = null;

	// Creates 2 regular users and 1 collection
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


	it("Can't create image in other person's collection.", function(done){

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
					title: 'Tundra',
					description: 'Very cold place',
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

		function(errors, result){

			// Attempt to create image in other user's collection
			testApiRequest(client_a, 'image.create', {
				title: 'Image will fail',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'

			}, function(error, package){

				package.status.should.equal(false);
				package.type.should.equal('image.create');
				package.should.have.property('error');
				package.error.should.equal('generic');
				done();

			});

		});

	});

	it("Can create image in own collection.", function(done){

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
					title: 'Tundra',
					description: 'Very cold place',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			}

		}, 

		function(errors, result){

			// Attempt to create image in other user's collection
			testApiRequest(client_a, 'image.create', {
				title: 'Image will work',
				collection_id: result.collection.data.collection._id,
				image_file_url: 'url goes here'

			}, function(error, package){

				package.status.should.equal(true);
				package.type.should.equal('image.create');
				package.should.not.have.property('error');
				package.should.have.property('data');
				package.data.should.have.property('image');
				package.data.image.should.have.properties({
					title: 'Image will work',
					collection_id: result.collection.data.collection._id,
					image_file_url: 'url goes here'
				});
				
				done();

			});

		});

	});


});