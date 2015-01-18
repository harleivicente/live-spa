/*
	
	-> GIVEN
		4 clients, 4 Logged users (A, B, C, D[root])

		A,B @collections.mine
		C @collections:public
		D @admin
	
	-> WHEN
		A creates a collection

	-> THEN
		A,C,D only receive a broadcast

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
					sendLocation(gClients[0], 'collections.mine');
					sendLocation(gClients[1], 'collections.mine');
					sendLocation(gClients[2], 'collections.public');
					sendLocation(gClients[3], 'admin');
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



	it("stuff", function(done){
		done();
	});

});