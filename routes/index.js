var express = require('express');
var router = express.Router();
var fs = require('fs');
var util = require('util');
var uuid = require('uuid');
/*all middleware requires*/

/*reading from the text file and creating a list of the possible words to use*/
var wordlist = {};
fs.readFile('routes/wordlist.txt', function(err, data) {
	wordlist = data.toString().split('\n');
});

/*Metadata variable*/
var Metadata = {
	fonts : {Lato: new Font('Sans Serif', 'Lato', 'sans-serif', 'https://fonts.googleapis.com/css?family=Lato'),
			Lobster: new Font('Display', 'Lobster', 'Impallari Type', 'https://fonts.googleapis.com/css?family=Lobster'),
			Kavivanar: new Font('Handwriting', 'Kavivanar', 'cursive', 'https://fonts.googleapis.com/css?family=Kavivanar'),
			Oswald: new Font('Sans Serif', 'Oswald', 'sans-serif', 'https://fonts.googleapis.com/css?family=Oswald'),
			IndieFlower: new Font('Handwriting', 'Indie Flower', 'cursive', 'https://fonts.googleapis.com/css?family=Indie+Flower')},
	levels : {easy : new Level(8, 5, 3, 'easy'), medium : new Level(7, 10, 4, 'medium'), hard : new Level(6, 300, 9, 'hard')},
	defaults : {colors : new Colors('#FF0000', '#FF0000', '#FF0000'), font : new Font('Display', 'Lobster', 'Impallari Type', 'https://fonts.googleapis.com/css?family=Lobster'), level : new Level(7, 4, 10, 'medium')}
};
/*variables for sid, gameDB array, and an array of current selected words.
	both of the object arrays are keyed on game id*/
var sid = uuid();
var gameDB = {};
var currentWords = {};

var createGame = function(colors, font, level) {
	var game = new Game(colors, font, level);
	gameDB[game.id] = game;
	return game;
}

/*function for creating the levels*/
function Level(rounds, maxLength, minLength, name) {
	this.rounds = rounds;
	this.maxLength = maxLength;
	this.minLength = minLength;
	this.name = name;
}

/*function for creating fonts*/
function Font(category, family, rule, url) {
	this.category = category;
	this.family = family;
	this.rule = rule;
	this.url = url;
}

/*function for creating colors*/
function Colors (guess, text, word) {
	this.guessBackground = guess;
	this.textBackground = text;
	this.wordBackground = word;
}

/*game function, as per instruction, some elements are omitted until completion*/
function Game(colors, font, level) {
	function guid() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4(); 
	}
	for (var k in Metadata.levels) {
		if (Metadata.levels[k].name === level) this.level = Metadata.levels[k];
	}
	this.id = guid();
	this.colors = colors;
	for (var k in Metadata.fonts) {
		if (Metadata.fonts[k].family === font) this.font = Metadata.fonts[k];
	}
	this.guesses = '';
	this.timestamp = + new Date();
	this.status = 'unfinished';
	this.remaining = this.level.rounds;
	var word = wordPick(this.level.minLength, this.level.maxLength);
	currentWords[this.id] = word;
	this.view = Array(word.length).join('_');
}

/*function is given the minimum length and maximum length to be used when determining
  The random word that will be selected.  if it doesn't fit thos requirements it will
  randomly select another word until it is within the acceptable bounds*/
function wordPick(minLength, maxLength) {
	function getInt() {
		return Math.floor(Math.random() * Math.floor(wordlist.length));
	}
	var pick = wordlist[getInt()];
	while (pick.length < minLength || pick.length > maxLength) {
		pick = wordlist[getInt()];
	}
	return pick;
}

/*string replacement function. This adds functionality to the string class inside of
  JavaScript. This allows characters to be placed at specific indexes inside of a string*/
String.prototype.setCharAt = function(index, chr) {
	if (index > this.length) return this.toString();
	return this.substring(0, index) + chr + this.substring(index+1);
}
/*variable of defaults*/
var Defaults = Metadata.defaults;

/*Error function to generate new erroe messages when called*/
function Error(msg) {
	this.msg = msg;
}

/*================================ROUTES====================================*/

/* GET home page. */
router.get('/wordgame', function(req, res, next) {
	res.status(200);
	res.sendFile('index.html', { root : __dirname + "/../public"} );
});

/*GET /wordgame/api/v1/sid*/
router.get('/wordgame/api/v1/sid', function(req, res, next) {
	res.status(200);
	res.send(sid);
});

/*GET /wordgame/api/v1/meta*/
router.get('/wordgame/api/v1/meta', function(req, res, next) {
	if (!Metadata) {
		res.status(200).send(new Error('Metadata object not found'));
	}
	res.status(200).send(Metadata);
});

/*GET /wordgame/api/v1/meta/fonts*/
router.get('/wordgame/api/v1/meta/fonts', function(req, res, next) {
	res.status(200);
	if (!Metadata.fonts) {
		res.status(200).send(new Error('Metadata fonts object does not exist'));
	}
	res.send(Metadata.fonts);
});

/*GET /wordgame/api/v1/:sid*/
router.get('/wordgame/api/v1/:sid', function(req, res, next) {
	if (!sid) {
		res.status(200).send(new Error('The given sid does not exist or is not found'));
	} else {
		res.status(200).send(gameDB);
	}
});

/*POST /wordgame/api/v1/sid*/
router.post('/wordgame/api/v1/:sid', function(req, res, next) {
	var params = req.params.sid;
	var game = createGame(req.body.colors, req.get('X-font'), req.query.level);
	if (!game) {
		res.status(200).send(new Error('Could not create a new game'));
	}
	res.status(200).send(game);
});

/*GET /wordgame/api/v1/:sid/:gid*/
router.get('/wordgame/api/v1/:sid/:gid', function(req, res, next) {
	var params = req.params.sid;
	var game = req.params.gid.substring(1);
	var result = gameDB[game] || {status : 'No such game'};
	if (!result) {
		res.status(200).send(new Error('Could not find game.'));
	}
	res.status(200).send(result);
});

/*checks if the guessed character is inside of the target word and adds that char to the 
  view and then returns the updated view. This will also change the status of the game if
  when won or lost and places the target word and time to complete function inside of 
  the game when it is completed*/
/*GET /wordgame/api/v1/sid*/
router.post('/wordgame/api/v1/:sid/:gid/guesses', function(req, res, next) {
	var sid = req.params.sid;
	var game = gameDB[req.params.gid.substring(1)] || {status: 'no such game'};
	var guess = req.query.guess.toLowerCase();
	game.guesses = game.guesses + guess;
	var word = currentWords[game.id];
	if (!game) {
		res.status(200).send(new Error('Could not find game'));
	}
	if (word.includes(guess)) {
		for (var i = 0; i < word.length; i++) {
			if (word[i] === guess) {
				game.view = game.view.setCharAt(i, guess);
			}
		}
	} else {
		game.remaining--;
	}
	if (!game.view.includes('_')) {
		game.status = 'victory';
		game.target = word;
		game.timeToComplete = new Date()-game.timestamp;
	}
	if (game.remaining == 0) {
		game.status = 'loss';
		game.target = word;
		game.timeToComplete = new Date()-game.timestamp;
	}
	gameDB[req.params.gid.substring(1)] = game;
	res.status(200).send(game);
});

module.exports = router;
