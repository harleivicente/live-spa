/*

user.signup
	Create new account

@param string displayName
@param string email
@param string username
@param string passwordHash

*/
module.exports = function(params, callback){
	callback(true, {msg: 'hello there', param: params.title});
};