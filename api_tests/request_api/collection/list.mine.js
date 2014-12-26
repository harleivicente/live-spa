describe("collection.list.mine",function(){
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

	it("User will only see own collections.", function(done){

		async.series({
			
			// Log is as regular_a
			regular_a_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Create collection A
			collection_a: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'list.public title 1',
					description: 'Jose is crazy',
					privacy: 'public',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			},

			// Create collection B
			collection_b: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'list.public title 2',
					description: 'Jose is crazy',
					privacy: 'private',
					cover_file_url: 'some_url2.jpeg'
				}, ready);
			},				

			// Log is as regular_b
			regular_b_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_b.username,
					password: 'api.test'
				}, ready);
			},

			// Create collection C
			collection_c: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'list.public title 3',
					description: 'Jose is crazy',
					privacy: 'public',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			},

			// Create collection D
			collection_d: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'list.public title 4',
					description: 'Jose is crazy',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			},

			// Attempt to list
			package: function(ready){
				testApiRequest(client_a, 'collection.list.mine', {}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(true);
			result.package.type.should.equal('collection.list.mine');
			result.package.should.not.have.property('error');
			result.package.should.have.property('data');
			result.package.data.should.have.property('collections');

			var found_a = found_b = found_c = found_d = false;

			result.package.data.collections.forEach(function(collection){
				if(collection._id === result.collection_a.data.collection._id)
					found_a = true;
				if(collection._id === result.collection_b.data.collection._id)
					found_b = true;
				if(collection._id === result.collection_c.data.collection._id)
					found_c = true;
				if(collection._id === result.collection_d.data.collection._id)
					found_d = true;
			});

			found_a.should.equal(false);
			found_b.should.equal(false);
			found_c.should.equal(true);
			found_d.should.equal(true);
			done();
		});

	});


	it("User may not use api if not logged.", function(done){

		async.series({
			
			// Attempt to list
			package: function(ready){
				testApiRequest(client_a, 'collection.list.mine', {}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('collection.list.mine');
			result.package.should.property('error');
			result.package.error.should.equal('generic');
			done();
		});

	});


});