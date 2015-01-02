/*
SERVER REQUEST API

collection.list
	Lists all collections

@params number limit
@params number offset
@params string orderBy - ['recent', 'title', 'score', null]
@params boolean reverseOrder

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

		Collection.find()
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

	} else {
		callback(false);
	}
};