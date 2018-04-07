var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var User = require('./userModel');
var users = require('./users');
var db;

/*starting up the database*/
mongoClient.connect("mongodb://localhost:27017", function(err, database) {
	assert.equal(null, err);
	console.log('connected to the databse');

	db = database.db('games');
	/*db.collection('games').drop(function(err, delOK) {
		if (err) throw err;
		if (delOK) console.log('games gone');
		db.collection('users').drop(function(err2, delOK2) {
			if (err2) throw err2;
			if (delOK2) console.log('Users gone');
		});
	});*/
});

module.exports = {collection : (name) => db.collection(name)}