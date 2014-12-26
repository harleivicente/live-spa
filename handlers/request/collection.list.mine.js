/*
SERVER REQUEST API

collection.list.mine
	Lists all collections owned by logged user

@reply collections [Collection]

@permission - Logged into app

*/
module.exports = function(params, callback){
	var Collection = gDb.model('Collection');

	var logged_user = session.getLoggedUser();

	if(!logged_user){
		callback(false);
	} else {
		Collection.find({owner_id: logged_user.getId()}, function(error, collections){
			if(error){
				callback(false);
			} else {
				callback(true, {collections: collections});
			}
		});
	}
};