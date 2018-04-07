/*users page*/
var db = require('./db');
var User = require('./userModel');
var mongo = require('mongodb');
var bcrypt = require('bcrypt');

function init(defaults, cb) {
	var saved = 0;
	result = [];
	var user1 = new User('a@b.com', '123', defaults, 'ADMIN', 'Bilbo', 'Baggins', true);
	var user2 = new User('b@c.com', '1234', defaults, 'USER', 'Frodo', 'Baggins', true);
	var userArr = [user1, user2];
	userArr.forEach( user => {
		save(user, (err, newUser) => {result.push(newUser); if (result.length == 2) cb(null, result);});
	});
};
module.exports.init = init;

function transformUser(user) {
	if(user) {
		user.id = user._id;
		delete user._id;
	}
	return user;
}

/*save function called by /users/init will check if the given user already exists inside of the database using
  the mongodb .find(function). if it cannot be found an error is thrown will signals for the given user
  to be inerted into the database. callback function then returns the result in either fashion*/
function save(user, cb) {
	db.collection('users').findOne({email : user.email}, function(err1, result) {
		if (err1) throw err1;
		bcrypt.hash(user.password, 10, function(err, hash) {
			if (err) throw err;
			user.password = hash;
			db.collection('users').insertOne(user, function(err2, newUser) {
				cb(err2, newUser.ops[0]);
			});
		});
		
	});
}
module.exports.save = save;

function findAll(cb) {
	db.collection('users').find().toArray(function(err, users) {
		cb(err, users);
	});
}
module.exports.findAll = findAll;

function findById(id, cb) {
	db.collection('users').findOne({ '_id' : new mongo.ObjectID(id)}, function(err, user) {
		cb(err, user);
	});
}
module.exports.findById = findById;

function findByEmail(email, cb) {
	db.collection('users').findOne({email : email}, function(err, user) {
		cb(err, user);
	});
}
module.exports.findByEmail = findByEmail;

function updateDefaults(id, defaults, cb) {
	var myQuery = {'_id' : new mongo.ObjectID(id)};
	var newValues = {$set: {defaults: defaults}};
	db.collection('users').updateOne(myQuery, newValues, function(err, result) {
		findById(id, cb);
	});
}
module.exports.updateDefaults = updateDefaults;

function updateUser(id, role, enabled, cb) {
	var myQuery = {'_id' : new mongo.ObjectID(id)};
	var newValues = {$set: {role : role, enabled : enabled}};
	db.collection('users').updateOne(myQuery, newValues, function(err, result) {
		findById(id, cb);
	});
}
module.exports.updateUser = updateUser;