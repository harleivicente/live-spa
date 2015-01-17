/*
SERVER REQUEST API

collection.remove
	Removes a collection. Images that belong to the collection are also
	removed.

@param string collectionId

@permission - Logged as collection owner or root user.


*/
module.exports = function(params, callback, session){
	var Collection = gDb.model('Collection');

	if(!params.collectionId){
		callback(false);
	} else {

		Collection.findById(params.collectionId, function(error, collection){

			// User does not exist
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

				if(cleared){
					
					// Remove collection
					collection.remove(function(error, collection){

						// Broadcast collection removal
						
						
						callback(!Boolean(error));
					});

				} else {
					callback(false);
				}
			}

		});
	}

};