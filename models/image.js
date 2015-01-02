/*

Image model

@property string title
@property string image_file_url
@property string collection_id
@property number avg_score

*/
var schema = new gDb.Schema({
	title: {type: String, required: true},
	image_file_url: {type: String, required: true},
	collection_id: {type: gDb.Schema.Types.ObjectId, required: true},
	avg_score: {type: Number, init: -1}
});

schema.methods.getCollectionId = function(){
	return this.collection_id.toString();
}


/*
	Logged user scores a collection

	@param number score
	@param function callback - Args: error, image
	
	@internal - Will recalculate average score of image.
	
*/
schema.methods.score = function(score, callback){
	if(typeof score !== "number"){
		callback(true, null);
	}

	var instance = this;

	var ImageScore = gDb.model('ImageScore');
	loggedUser = session.getLoggedUser();

	ImageScore.findOne({imageId: instance._id, userId: loggedUser._id}, function(error, image_score){

		if(error){
			callback(error, null);
		} else {

			if(image_score){
				image_score.score = score;
				image_score.save(function(error, image_score){
					callback(error, instance);
				});

			} else {
				var new_score = new ImageScore({
					imageId: instance._id,
					userId: loggedUser._id,
					score: score
				});

				new_score.save(function(error, image_score){
					callback(error, instance);
				});
			}

		}

	});
}


/*
Obtains the collection of the image

@param function callback - Args: error, collection
*/
schema.methods.getCollection = function(callback){
	var Collection = gDb.model('Collection');
	Collection.findById(this.getCollectionId(), function(error, collection){
		callback(error, collection);
	});
}

// schema.methods.fn = function(){}

gDb.model('Image', schema);

