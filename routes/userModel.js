/*user object type definitions*/
function User(email, password, defaults, role, fname, lname, enabled) {
	this.email = email;
	this.password = password;
	this.defaults = defaults;
	this.role = role;
	this.name = {first : fname, last : lname};
	this.enabled = enabled;
}

module.exports = User;