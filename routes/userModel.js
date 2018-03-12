/*user object type definitions*/
function User(email, password, defaults) {
	this.email = email;
	this.password = password;
	this.defaults = defaults;
}

module.exports = User;