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

/*
	Post save handler

	1) Update Image average score recalculation

*/
schema.post('save', function(image_score){
		
});


gDb.model('ImageScore', schema);

