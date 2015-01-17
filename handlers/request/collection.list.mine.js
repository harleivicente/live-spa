/*
SERVER REQUEST API

collection.list.mine
	Lists all collections owned by logged user

@reply collections [Collection]

@params number limit
@params number offset
@params string orderBy - ['recent', 'title', 'score', null]
@params boolean reverseOrder

@permission - Logged into app

*/
module.exports = function(params, callback, session){
	var Collection = gDb.model('Collection');

	var logged_user = session.getLoggedUser();

	if(!logged_user){
		callback(false);
	} else {

		var limit = params.limit ? params.limit : null;
		var offset = params.offset ? params.offset : 0;

		var sort_options = {};
		var sort_direction = params.reverseOrder ? 1 : -1;

		if(params.orderBy === 'recent'){
			sort_options['_id'] = sort_direction;
		} else if(params.orderBy === 'score') {
			sort_options['avg_score'] = sort_direction;
		} else if(params.orderBy === 'title'){
			sort_options['title'] = sort_direction;
		}

		Collection.find({owner_id: logged_user.getId()})
		.limit(limit)
		.skip(offset)
		.sort(sort_options)
		.exec(function(error, collections){
			if(error || !collections){
				callback(false);
			} else {
				callback(true, {collections: collections});
			}
		});

	}

};