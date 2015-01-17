/*
SERVER REQUEST API

image.remove
	Removes an image.

@param string imageId

@permission - Logged as owner of collection that imge belongs to or root user.

*/
module.exports = function(params, callback, session){
	var Image = gDb.model('Image');

	if(!params.imageId){
		callback(false);
	} else {

		Image.findById(params.imageId, function(error, image){

			// Image does not exist
			if(error || !image){
				callback(false);
			} else {

				image.getCollection(function(error, collection){

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
							
							// Remove image
							image.remove(function(error, image){

								// Broadcast image removal
								
								callback(!Boolean(error));
							});

						} else {
							callback(false);
						}
						

					}
				});

			}

		});
	}

};