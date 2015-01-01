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

// schema.methods.fn = function(){}

gDb.model('Image', schema);

