/*
SERVER REQUEST API

collection.list.public
	Lists all public collections

@reply collections [Collection]

@permission - Root user

*/
module.exports = function(params, callback){
	var Collection = gDb.model('Collection');

	Collection.find({privacy: "public"}, function(error, collections){
		if(error || !collections){
			callback(false);
		} else {
			callback(true, {collections: collections});
		}
	});

};