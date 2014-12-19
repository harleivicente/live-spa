describe("user.list",function(){

	beforeEach(function(ready){
		var options = {
			transports: ['websocket'],
  			'force new connection': true
		};

		client_a = socket_io(base_url, options);
		ready();
	});

	afterEach(function(ready){
		client_a.disconnect();
		ready();
	});

	it("Will not allow access to non-root users.", function(done){

		var regular_user_seed = Math.random();

		async.series([
			
			// Create a new regular user
			function(ready){

				client_a.on('client.response', function(package){
					if(package.id === 1 && package.status){
						// console.log('Reguar user created.')
						ready();
					}
				});

				client_a.emit('server.request', {
					type: 'user.signup',
					id: 1,
					params: {
						displayName: 'api.test',
						password: 'api.test',
						email: 'api.test.' + regular_user_seed,
						username: 'api.test.' + regular_user_seed
					}
				});
			},

			// Log is as the user
			function(ready){
				
				client_a.on('client.response', function(package){
					if(package.id === 2 && package.status){
						// console.log('Logged as regular user.');
						ready();
					}
				});

				client_a.emit('server.request', {
					type: 'user.login',
					id: 2,
					params: {
						username: 'api.test.' + regular_user_seed,
						password: 'api.test'
					}
				});

			}
		], 

		function(){

			client_a.on('client.response', function(package){
				if(package.id === 3){
					package.status.should.equal(false);
					package.type.should.equal('user.list');
					package.error.should.equal('generic');
					done();
				}
			});

			client_a.emit('server.request', {
				type: 'user.list',
				id: 3
			});
			// console.log('List request emitted.');

		});

	});


	it("Will list a new user if root is logged in.", function(done){

		var regular_user_seed = Math.random();

		async.series([
			
			// Create a new regular user
			function(ready){

				client_a.on('client.response', function(package){
					if(package.id === 1 && package.status){
						// console.log('Reguar user created.')
						ready();
					}
				});

				client_a.emit('server.request', {
					type: 'user.signup',
					id: 1,
					params: {
						displayName: 'api.test',
						password: 'api.test',
						email: 'api.test.' + regular_user_seed,
						username: 'api.test.' + regular_user_seed
					}
				});
			},

			// Log is as the root
			function(ready){
				
				client_a.on('client.response', function(package){
					if(package.id === 2 && package.status){
						// console.log('Logged as root user.');
						ready();
					}
				});

				client_a.emit('server.request', {
					type: 'user.login',
					id: 2,
					params: {
						username: 'root',
						password: 'root'
					}
				});

			}
		], 

		function(){

			client_a.on('client.response', function(package){
				if(package.id === 3){
					package.status.should.equal(true);
					package.type.should.equal('user.list');
					package.should.not.have.property('error');
					package.should.have.property('data');
					package.data.should.have.property('users');
					package.data.users.should.be.Array;

					var found = false;
					package.data.users.forEach(function(user){
						if(user.username === 'api.test.' + regular_user_seed)
							found = true;
					});

					found.should.equal(true);

					done();
				}
			});

			client_a.emit('server.request', {
				type: 'user.list',
				id: 3
			});
			// console.log('List request emitted.');

		});

	});

});