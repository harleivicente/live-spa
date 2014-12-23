/*
SERVER REQUEST API

collection.collection
	Requests details of one collection

@param string collectionId

@reply collection Collection

@error private - If collection is not owned by logged user and is private.

@permission - Root user or logged as owner

*/
module.exports = function(params, callback){
	var Collection = gDb.model('Collection');

	if(typeof params.collectionId === "undefined"){
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

				if(!collection.isPrivate()){
					cleared = true;
				} else if(!loggedUser){
					cleared = false;
				} else if(loggedUser.isRoot()) {
					cleared = true;
				} else if(loggedUser.getId() === collection.getOwnerId()){
					cleared = true;
				}

				if(cleared){
					callback(true, {collection: collection});
				} else {
					callback(false, "private");
				}
			}
		});

	}


};