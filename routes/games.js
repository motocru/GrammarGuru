var db = require('./db');
var mongo = require('mongodb');

function create(game, cb) {
	var result = game;
	db.collection('games').insertOne(result, function(err, writeResult) {
		cb(err, writeResult.ops[0]);
	});
};
module.exports.create = create;

function find(userId, gid, cb) {
	db.collection('games').findOne({userId : userId, '_id' : new mongo.ObjectID(gid)}, function(err, game) {
		cb(err, game);
	});
};
module.exports.find = find;

function findByOwner(userId, cb) {
	db.collection('games').find({userId : userId}).toArray(function(err, games) {
		cb(err, games);
	});
};
module.exports.findByOwner = findByOwner;

function updateGame(gid, newGame, done, cb) {
	var myQuery = {userId : newGame.userId, '_id' : new mongo.ObjectID(gid)};
	var newValues;
	if (done) {
		newValues = {remaining : newGame.remaining,
					 guesses : newGame.guesses,
					 view : newGame.view,
					 status : newGame.status,
					 timeToComplete : newGame.timeToComplete,
					 target : newGame.target};
	} else {
		newValues = {remaining : newGame.remaining,
					 view : newGame.view,
					 guesses : newGame.guesses};
	}
	db.collection('games').updateOne(myQuery, {$set : newValues}, function(err, res) {
		find(newGame.userId, gid, cb);
	});
};
module.exports.updateGame = updateGame;