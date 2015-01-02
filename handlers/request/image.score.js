/*
SERVER REQUEST API

image.score
	User scores an image

@param string imageId
@param number score

@reply image Image

@permission All if image is public. Root user or owner of collection the image belongs to if private

*/
module.exports = function(params, callback){
	var Image = gDb.model('Image');

	if(typeof params.imageId !== "string" || typeof params.score !== 'number'){
		callback(false);
	} else {

		Image.findById(params.imageId, function(error, image){
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

						if(!collection.isPrivate()){
							cleared = true;
						} else if(!loggedUser){
							cleared = false;
						} else if(loggedUser.isRoot()) {
							cleared = true;
						} else if(loggedUser.getId() === collection.getOwnerId()){
							cleared = true;
						}

						if(!cleared){
							callback(false);
						} else {

							image.score(params.score, function(error, image){
								if(error){
									callback(false);
								} else {
									callback(true, {image: image});
								}
							});

						}

					}

				});
				
			}
		});

	}

};