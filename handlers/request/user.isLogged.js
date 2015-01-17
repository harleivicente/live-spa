/*
SERVER REQUEST API

user.isLogged
	Checks if user is logged in.

*/
module.exports = function(params, callback, session){
	var logged_user = session.getLoggedUser();
	callback(true, {logged: Boolean(logged_user)});
};