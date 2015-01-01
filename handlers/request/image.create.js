/*
SERVER REQUEST API

image.create
	Create new image

@param string title
@param string collection_id
@param string image_file_url

@permission - Root user or owner of collection

@reply image Image

*/
module.exports = function(params, callback){
	var Image = gDb.model('Image');
	var Collection = gDb.model('Collection');
	var loggedUser = session.getLoggedUser();

	Collection.findById(params.collection_id, function(error, collection){

		if(error || !collection){
			callback(false);
		} else {


			/*
				Permission check
			*/
				var cleared = false;
				if(!loggedUser){
					cleared = false;
				} else if(loggedUser.isRoot()) {
					cleared = true;
				} else if(collection.getOwnerId() === loggedUser.getId()) {
					cleared = true;
				}

				if(cleared){

					var options = {
						title: params.title,
						collection_id: params.collection_id,
						image_file_url: params.image_file_url
					};

					var image = new Image(options);

					image.save(function(error){
						if(error){
							callback(false);
						} else {
							callback(true, {image: image});
						}
					});

				} else {
					callback(false);					
				}

		}
	});

};