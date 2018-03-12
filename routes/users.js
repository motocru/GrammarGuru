/*users page*/
var db = require('./db');
var User = require('./userModel');
var mongo = require('mongodb');

function init(defaults, cb) {
	var saved = 0;
	var result = [];
	var user1 = new User('bilbo@mordor.org', '123123123', defaults);
	var user2 = new User('frodo@mordor.org', '234234234', defaults);
	var user3 = new User('samwise@mordor.org', '345345345', defaults);
	save(user1, (err, newUser) => {result.push(newUser);});
	save(user2, (err, newUser) => {result.push(newUser);});
	save(user3, (err, newUser) => {result.push(newUser);});
	db.collection('users').find({}).toArray(function(err, res) {
		cb(err, res);
	});
	//cb(null, result);
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
		if (err1) {
			db.collection('users').insertOne(user, function(err2, newUser) {
				cb(err2, newUser);
			});
		} 
		cb(err1, result);
	});
	/*db.collection('users').save(user, function(err1, writeResult) {
		db.collection('users').findOne(user, function(err2, savedUser) {
			cb(err1 || err2, savedUser);
		});
	});
	*/
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