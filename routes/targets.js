var db = require('./db');
var Target = require('./targetModel');
var mongo = require('mongodb');

function create(gid, uid, word, cb) {
	var result = new Target(gid, uid, word);
	db.collection('targets').insertOne(result, function(err, writeResult) {
		cb(err, writeResult.ops[0]);
	});
};
module.exports.create = create;

function find(gid, uid, cb) {
	db.collection('targets').findOne({uid : uid, gid : gid}, function(err, target) {
		cb(err, target.word);
	});
};
module.exports.find = find;

function findByOwner(uid, cb) {
	db.collection('targets').find({uid : uid}).toArray(function(err, targetList) {
		cb(err, targetList);
	});
};
module.exports.findByOwner = findByOwner;