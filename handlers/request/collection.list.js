/*
SERVER REQUEST API

collection.list
	Lists all collections

@reply collections [Collection]

@permission - Root user

*/
module.exports = function(params, callback){
	var Collection = gDb.model('Collection');

	/*
		Permission check
	*/
	var loggedUser = session.getLoggedUser();

	if(loggedUser.isRoot()) {

		Collection.find({}, function(error, collections){
			if(error || !collections){
				callback(false);
			} else {
				callback(true, {collections: collections});
			}
		});

	} else {
		callback(false);
	}
};