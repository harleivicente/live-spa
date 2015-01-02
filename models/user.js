/*

User model

@property displayName
@property email
@property username
@property passwordHash

*/
var schema = new gDb.Schema({
	displayName: {type: String, required: true},
	root: {type: Boolean, init: false},
	email: {type: String, required: true},
	username: {type: String, required: true, index: { unique: true}},
	passwordHash: {type: String, required: true}
});

schema.methods.setPasswordHash = function(password){
	this.passwordHash = password;
}

schema.methods.isRoot = function(){
	return this.root;
}

schema.methods.getId = function(){
	return this._id.toString();
}

/*
	Pre remove middleware

	1) remove associated image scores

*/
schema.pre('remove', function(pre_ready){
	var ImageScore = gDb.model('ImageScore');

	ImageScore.find({userId: this._id}, function(error, image_scores){

		async.each(image_scores, 
			function(image_score, ready){
				image_score.remove(ready);
			}, 
			function(error){
				if(!error)
					pre_ready();
			}
		);

	});
});


/*
	Pre remove middleware

	1) remove associated collections

*/
schema.pre('remove', function(pre_ready){
	var Collection = gDb.model('Collection');

	Collection.find({owner_id: this._id}, function(error, collections){

		async.each(collections, 
			function(collection, ready){
				collection.remove(ready);
			}, 
			function(error){
				if(!error)
					pre_ready();
			}
		);

	});
});

gDb.model('User', schema);

