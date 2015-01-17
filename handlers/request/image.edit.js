/*
SERVER REQUEST API

image.edit
	Edits image

@param string imageId
@param string title [Optional]
@param string image_file_url [Optional]

@reply image Image

@permission Root user or owner of collection the image belongs to

*/
module.exports = function(params, callback, session){
	var Image = gDb.model('Image');
	var async = require("async");

	if(typeof params.imageId !== "string"){
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
								image.title = params.title;
							if(params.image_file_url)
								image.image_file_url = params.image_file_url;
							
							image.save(function(error){
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