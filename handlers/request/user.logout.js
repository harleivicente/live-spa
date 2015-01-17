/*
SERVER REQUEST API

user.logout
	User logs into server

*/
module.exports = function(params, callback, session){
	var User = gDb.model('User');
	var logged_out  = session.logOut();
	callback(Boolean(logged_out));
};