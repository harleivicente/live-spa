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

var privacy_validador = function(value){
	return ((value === "public") || (value === "private"));
}

// schema.methods.fn = function(){}

gDb.model('Collection', schema);

