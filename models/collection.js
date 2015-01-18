/*

Collection model

@property string title
@property string description
@property string privacy - ['public', 'private']
@property string cover_file_url
@property string owner_id

*/
var schema = new gDb.Schema({
	title: {type: String, required: true},
	description: {type: String, init: ""},
	privacy: {type: String, required: true, validade: privacy_validador},
	cover_file_url: {type: String, required: true},
	owner_id: {type: gDb.Schema.Types.ObjectId, required: true}
});

schema.methods.getOwnerId = function(){
	return this.owner_id.toString();
}

schema.methods.isPrivate = function(){
	return this.privacy === 'private';
}

/*
	Listss all images of collection

	@param options - {
		limit: <>,
		offset: <>,
		orderBy: <>, -  - [‘recent’, ‘score’, ‘title’, null]
		reverseOrder: <>
	}

	@param function callback - Args: error, images
*/
schema.methods.listImages = function(options, callback){
	var Image = gDb.model('Image');

	var limit = options.limit ? options.limit : 20;
	var offset = options.offset ? options.offset : 0;

	var sort_options = {};
	var sort_direction = options.reverseOrder ? 1 : -1;

	if(options.orderBy === 'recent'){
		sort_options['_id'] = sort_direction;
	} else if(options.orderBy === 'score') {
		sort_options['avg_score'] = sort_direction;
	} else if(options.orderBy === 'title'){
		sort_options['title'] = sort_direction;
	}

	Image
	.find({collection_id: this._id})
	.limit(limit)
	.skip(offset)
	.sort(sort_options)
	.exec(
		function(error, images){
			callback(error, images);
		}
	);

}

var privacy_validador = function(value){
	return ((value === "public") || (value === "private"));
}



/*
	Pre remove middleware

	1) removes all associated images

*/
schema.pre('remove', function(pre_ready){
	var Image = gDb.model('Image');

	Image.find({collection_id: this._id}, function(error, images){

		async.each(images, 
			function(image, ready){
				image.remove(ready);
			}, 
			function(error){
				if(!error)
					pre_ready();
			}
		);

	});
	
});


/*
	Post save
*/
schema.post('save', function(){
	
	gRooms.broadcast(

		// Data being broadcast
		{
			type: 'collection',
			data: {
				collection_id: this._id,
				author_id: this._loggedUser_id
			}
		},

		// Filters
		[
			{location: 'admin'},
			{location: 'collections:public'},
			{location: 'collection:' + this._id},
			{
				location: 'collections:mine',
				fn: function(User){
					if(User && User._id === this.getOwnerId())
						return true;
					else
						return false;
				}
			},
		]

	);


});


gDb.model('Collection', schema);

