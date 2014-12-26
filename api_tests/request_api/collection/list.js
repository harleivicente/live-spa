describe("collection.list",function(){
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


	it("Can't list all collection if not logged as root.", function(done){

		async.series({
			

			// Log is as regular
			regular_a_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: regular_a.username,
					password: 'api.test'
				}, ready);
			},

			// Attempt to list
			package: function(ready){
				testApiRequest(client_a, 'collection.list', {}, ready);
			}			

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(false);
			result.package.type.should.equal('collection.list');
			result.package.should.have.property('error');
			result.package.should.not.have.property('data');
			result.package.error.should.equal('generic');
			done();
		});

	});


	it("When logged as root can list all collections.", function(done){

		async.series({

			// Log is as root user
			root_login: function(ready){
				makeApiRequest(client_a, 'user.login', {
					username: 'root',
					password: 'root'
				}, ready);
			},

			// Create collection A
			collection_a: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'Jose',
					description: 'Jose is crazy',
					privacy: 'private',
					cover_file_url: 'some_url.jpeg'
				}, ready);
			},


			// Create collection B
			collection_b: function(ready){
				makeApiRequest(client_a, 'collection.create', {
					title: 'Jose 2',
					description: 'Jose is crazy',
					privacy: 'private',
					cover_file_url: 'some_url2.jpeg'
				}, ready);
			},

			// Attempt to list
			package: function(ready){
				testApiRequest(client_a, 'collection.list', {}, ready);
			}

		}, 

		// Results
		function(errors, result){
			result.package.status.should.equal(true);
			result.package.type.should.equal('collection.list');
			result.package.should.not.have.property('error');
			result.package.should.have.property('data');
			result.package.data.should.have.property('collections');

			var found = 0;
			result.package.data.collections.forEach(function(collection){
				if(
					collection._id === result.collection_a.data.collection._id ||
					collection._id === result.collection_b.data.collection._id
				) {
					found++;
				}
			});

			found.should.equal(2);
			done();
		});

	});



});