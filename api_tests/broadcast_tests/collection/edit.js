/*
	Checks broadcasting when a collection is edited.
	
	-> GIVEN
		4 clients [a,b,c,d], 4 Logged users (A, B, C, D[root])

		a,b @collections.mine
		c @collections:public
		d @admin
	
	-> WHEN
		A edits a collection

	-> THEN
		a,c,d only receive a broadcast
		b does not

*/
describe("broadcast.collection.edit",function(){
	gClients = gUsers = gCollection = null;

	// Create clients, users and login
	beforeEach(function(before_ready){
		gClients = createClients(4);

		async.series(
			[	
				// Create users
				function(next){
					createUsers([gClients[0], gClients[1], gClients[2]], function(users){
						gUsers = users;
						next(null, null);
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
							next(null, null);
						}
					);
				},

				// Set locations
				function(next){
					sendLocation(gClients[3], 'admin');
					sendLocation(gClients[1], 'collections:mine');
					sendLocation(gClients[2], 'collections:public');
					sendLocation(gClients[0], 'collections:mine');
					next(null, null);
				},

				// Creates collection
				function(next){
					makeApiRequest(gClients[0], 'collection.create', {
						title: 'Tundra',
						description: 'Very cold place',
						privacy: 'private',
						cover_file_url: 'some_url.jpeg'
					}, next);
				}

			],

			function(error, results){
				gCollection = results[3].data.collection;
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


	it("When collection is edited the correct clients receive a broadcast.", function(done){


		// A edits collection
		makeApiRequest(gClients[0], 'collection.edit', {
			collectionId: gCollection._id,
			description: 'league anime ?*',
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