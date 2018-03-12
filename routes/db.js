var mongoClient = require('mongodb').MongoClient;
var User = require('./userModel');
var users = require('./users');
var db;

/*starting up the database*/
mongoClient.connect("mongodb://localhost:27017/games", function(err, database) {
	if (err) throw err;

	db = database.db('games');
});

module.exports = {collection : (name) => db.collection(name)}