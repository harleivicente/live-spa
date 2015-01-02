/*

ImageScore model

@property string imageId
@property string userId
@property string score

*/
var schema = new gDb.Schema({
	imageId: {type: gDb.Schema.Types.ObjectId, required: true},
	userId: {type: gDb.Schema.Types.ObjectId, required: true},
	score: {type: Number, required: true}
});

// schema.methods.fn = function(){}

gDb.model('ImageScore', schema);

