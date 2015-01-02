/*
SERVER REQUEST API

image.list.collection
	Requests all images of a collection

@param string collectionId
@param number limit
@param number offset
@param string orderBy - [‘recent’, ‘score’, ‘title’, null]
@param boolean reverseOrder

@reply images [Image]

@permission - All, if public. Owner of collection or Root , if private.

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

					var options  = {
						limit: params.limit,
						offset: params.offset,
						orderBy: params.orderBy,
						reverseOrder: params.reverseOrder
					};
						
					collection.listImages(options, function(error, images){
						if(error){
							callback(false);
						} else {
							callback(true, {images: images});
						}
					});


				} else {
					callback(false);
				}
			}
		});

	}


};