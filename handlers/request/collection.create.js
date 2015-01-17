/*
SERVER REQUEST API

collection.create
	Create new collection, owned by logged user

@param string title
@param string description
@param string privacy - ['private', 'public']
@param string cover_file_url

@reply collection Collection

*/
module.exports = function(params, callback, session){
	var Collection = gDb.model('Collection');
	var async = require("async");

	var loggedUser = session.getLoggedUser();

	if(!loggedUser){
		callback(false);
	} else {
		var options = {
			title: params.title,
			description: params.description,
			privacy: params.privacy,
			owner_id: loggedUser.getId(),
			cover_file_url: params.cover_file_url
		};

		var collection = new Collection(options);

		collection.save(function(error){
			if(error){
				callback(false);
			} else {
				callback(true, {collection: collection});
			}
		});
	}
			


};