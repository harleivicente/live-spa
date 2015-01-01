/*
SERVER REQUEST API

image.image
	Requests details of one image

@param string imageId

@reply image Image

@error private - If image belongs to collection that is not owned by logged user and is private.

@permission - Root user or logged as owner o collection

*/
module.exports = function(params, callback){
	var Image = gDb.model('Image');

	if(typeof params.imageId === "undefined"){
		callback(false);
	} else {
		
		Image.findById(params.imageId, function(error, image){
			if(error || !image){
				callback(false);
			} else {

				/*
					Permission check
				*/
				image.getCollection(function(error, collection){

					if(error || !collection){
						callback(false);
					} else {

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
							callback(true, {image: image});
						} else {
							callback(false, "private");
						}
						

					}

				});


			}
		});

	}


};