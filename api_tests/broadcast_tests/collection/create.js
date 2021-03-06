/*
	Checks broadcasting when a collection is created.
	
	-> GIVEN
		4 clients [a,b,c,d], 4 Logged users (A, B, C, D[root])

		a,b @collections.mine
		c @collections:public
		d @admin
	
	-> WHEN
		A creates a collection

	-> THEN
		a,c,d only receive a broadcast
		b does not

*/
describe("broadcast.collection.create",function(){
	gClients = gUsers = null;

	// Create clients, users and login
	beforeEach(function(before_ready){
		gClients = createClients(4);

		async.series(
			[	
				// Create users
				function(next){
					createUsers([gClients[0], gClients[1], gClients[2]], function(users){
						gUsers = users;
						next(null);
					});
				},

				// Log in
				function(next){
					async.times(4, 
						function(iterator, ready){
							if(iterator <= 2){
								var username = gUsers[iterator].username;
								var password = gUsers[iterator].password;
							} else {
								// log user #4 as root
								username = 'root';
								password = 'root';
							}

							makeApiRequest(gClients[iterator], 'user.login', {
								username: username,
								password: password
							}, ready);
						},
						function(error, pkgs){
							next(null);
						}
					);
				},

				// Set locations
				function(next){
					sendLocation(gClients[3], 'admin');
					sendLocation(gClients[1], 'collections:mine');
					sendLocation(gClients[2], 'collections:public');
					sendLocation(gClients[0], 'collections:mine');
					next(null);
				}
			],

			function(error, results){
				before_ready();
			}
		);

	});


	afterEach(function(ready){
		gClients[0].disconnect();
		gClients[1].disconnect();
		gClients[2].disconnect();
		gClients[3].disconnect();
		ready();
	});


	it("When collection is created the correct clients receive a broadcast.", function(done){


		// A creates collection
		makeApiRequest(gClients[0], 'collection.create', {
			title: 'some title that u know',
			description: 'league anime ?',
			privacy: 'private',
			cover_file_url: 'some_url.jpeg'
		}, function(error, package){
			
			var expected_broadcast = {
				type: 'collection',
				data: {
					collection_id: package.data.collection._id,
					author_id: gUsers[0].user._id
				}
			};

			checkBroadcast(expected_broadcast, [gClients[3], gClients[2], gClients[0]], [gClients[1]], done);

		});

	});

});