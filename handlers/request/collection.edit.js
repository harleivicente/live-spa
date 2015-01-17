/*
SERVER REQUEST API

collection.edit
	Edits collection

@param string collectionId
@param string title [Optional] 
@param string description [Optional]
@param string privacy - ['private', 'public'] [Optional]
@param string cover_file_url [Optional]

@reply collection Collection

*/
module.exports = function(params, callback, session){
	var Collection = gDb.model('Collection');
	var async = require("async");

	if(typeof params.collectionId !== "string"){
		callback(false);
	} else {

		Collection.findById(params.collectionId, function(error, collection){
			if(error || !collection){
				callback(false);
			} else {

				/*
					Permission check
				*/
				var loggedUser = session.getLoggedUser();
				var cleared = false;
				if(!loggedUser){
					cleared = false;
				} else if(loggedUser.isRoot()) {
					cleared = true;
				} else if(loggedUser.getId() === collection.getOwnerId()){
					cleared = true;
				}

				if(!cleared){
					callback(false);
				} else {

					if(params.title)
						collection.title = params.title;
					if(params.description)
						collection.description = params.description;
					if(params.privacy)
						collection.privacy = params.privacy;
					if(params.cover_file_url)
						collection.cover_file_url = params.cover_file_url;
					
					collection.save(function(error){
						if(error){
							callback(false);
						} else {
							callback(true, {collection: collection});
						}
					});

				}

				
				
			}
		});

	}

			


};