/*

User model

@property displayName
@property email
@property username
@property passwordHash

*/
var schema = new gDb.Schema({
	displayName: {type: String, required: true},
	email: {type: String, required: true},
	username: {type: String, required: true, index: { unique: true}},
	passwordHash: {type: String, required: true}
});

schema.methods.setPasswordHash = function(password){
	this.passwordHash = password + '_temp_hash';
}

gDb.model('User', schema);

