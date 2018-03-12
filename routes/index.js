var express = require('express');
var router = express.Router();
var fs = require('fs');
var util = require('util');
var uuid = require('uuid');
var users = require('./users.js');
var games = require('./games');
var targets = require('./targets');
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
	defaults : {colors : new Colors('#8cfa05', '#FF0000', '#0090ff'), font : new Font('Display', 'Lobster', 'Impallari Type', 'https://fonts.googleapis.com/css?family=Lobster'), level : new Level(7, 4, 10, 'medium')}
};
/*variables for sid, gameDB array, and an array of current selected words.
	both of the object arrays are keyed on game id*/
var gameDB = {};
var currentWords = {};

var createGame = function(userId, colors, font, level) {
	var game = new Game(userId, colors, font, level);
	var retGame;
	//game.userId = userId;
	var word = wordPick(game.level.minLength, game.level.maxLength);
	game.view = Array(word.length).join('_');
	games.create(game, function(err, result) {
		console.log(result);
		currentWords[result._id] = word;
		return result._id;
	});
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
function Game(userId, colors, font, level) {
	for (var k in Metadata.levels) {
		if (Metadata.levels[k].name === level) this.level = Metadata.levels[k];
	}
	this.userId = userId;
	this.colors = colors;
	for (var k in Metadata.fonts) {
		if (Metadata.fonts[k].family === font) this.font = Metadata.fonts[k];
	}
	this.guesses = '';
	this.timestamp = + new Date();
	this.status = 'unfinished';
	this.remaining = this.level.rounds;
	//var word = wordPick(this.level.minLength, this.level.maxLength);
	//currentWords[this.id] = word;
	//this.view = Array(word.length).join('_');
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

/*Error function to generate new error messages when called*/
function Error(msg) {
	this.msg = msg;
}

/*================================ROUTES====================================*/
router.get('/users/init', function(req, res, next) {
	users.init(Defaults, (err,result) => {res.send(result);});
});

router.get('/', function (req, res, next) {
	res.redirect('/wordgame');
});
/* GET home page. */
router.get('/wordgame', function(req, res, next) {
	res.status(200);
	res.sendFile('index.html', { root : __dirname + "/../public"} );
});

/*login function checks database for user and creates a session with cookie and CSRF token. Else it rejects and 
  sends them back with a 403 error*/
router.post('/wordgame/api/v2/login', function(req, res, next) {
	req.session.regenerate(function(err) {
		users.findByEmail(req.body.email, function(err2, user) {
			if (user && user.password == req.body.password) {
				req.session.user = user;
				req.session.cookie.maxAge = 600000; //sets the maxAge so the cookie expires in 10 minutes
				delete user.password;
				userid = user._id;
				req.session.csrf = uuid();
				res.set('X-CSRF', req.session.csrf);
				//fill in CSRF token stuff here
				res.status(200).send(user);
			} else {
				res.status(403).send(new Error('Problem with email/password combo'));
			}
		});
	});
});

/*logs the user out by regenerating a new sesion*/
router.post('/wordgame/api/v2/logout', function(req, res, next) {
	req.session.regenerate(function(err) {
		res.status(200).send(new Error('success'));
	});
});

/*GET /wordgame/api/v1/sid*/
/*router.get('/wordgame/api/v2/userid', function(req, res, next) {
	res.status(200);
	res.send(userid);
});*/

/*GET /wordgame/api/v1/meta*/
router.get('/wordgame/api/v2/meta', function(req, res, next) {
	if (!Metadata) {
		res.status(200).send(new Error('Metadata object not found'));
	}
	res.status(200).send(Metadata);
});

/*GET /wordgame/api/v1/meta/fonts*/
router.get('/wordgame/api/v2/meta/fonts', function(req, res, next) {
	res.status(200);
	if (!Metadata.fonts) {
		res.status(200).send(new Error('Metadata fonts object does not exist'));
	}
	var result = [];
	for (var k in fonts) {
		result.push(Metadata.fonts[k]);
	}
	res.send(result);
});

/*function checks if the given userid is currently authenticated to access andy information beyond this point
  If they are it goes to the next function. Otherwise it denys access.*/
router.all('/wordgame/api/v2/:userid', function(req, res, next) {
	users.findById(req.params.userid, function(err, pathUser) {
		var authenticated = req.session.user;
		var token = req.get('X-CSRF');
		if (authenticated && pathUser && authenticated._id == pathUser._id && token == req.session.csrf) {
			next();
		} else {
			res.status(403).send(new Error('Not authenticated'));
		}
	});
});

/*GET /wordgame/api/v1/:sid*/
router.get('/wordgame/api/v2/:userid', function(req, res, next) {
	games.findByOwner(req.params.userid, function(err, gameList) {
		if (err) throw err;
		res.status(200).send(gameList);
	});
	/*var result = [];
	for (var k in gameDB) {
		result.push(gameDB[k]);
	}
	res.status(200).send(result);*/
});

/*POST /wordgame/api/v1/sid*/
router.post('/wordgame/api/v2/:userid', function(req, res, next) {
	var game = new Game(req.params.userid, req.body.colors, req.get('X-font'), req.query.level);
	if (!game) {
		res.status(200).send(new Error('Could not create a new game'));
	}
	var word = wordPick(game.level.minLength, game.level.maxLength);
	game.view = Array(word.length).join('_');
	games.create(game, function(err, result) {
		if (err) res.status(200).send(new Error('Game could not be created'));
		targets.create(result._id, result.userId, word, function(err2, targetResult) {
			res.status(200).send(result);
		});
	});
});

/*GET /wordgame/api/v1/:sid/:gid*/
router.get('/wordgame/api/v2/:userid/:gid', function(req, res, next) {
	games.find(req.params.userid, req.params.gid, function(err, result) {
		if (err) res.status(200).send(new Error('Could not find game'));
		res.status(200).send(result);
	});
	//var game = req.params.gid;
	//var result = gameDB[game] || {status : 'No such game'};
	//if (!result) {
	//	res.status(200).send(new Error('Could not find game.'));
	//}
	//res.status(200).send(result);
});



/*checks if the guessed character is inside of the target word and adds that char to the 
  view and then returns the updated view. This will also change the status of the game if
  when won or lost and places the target word and time to complete function inside of 
  the game when it is completed*/
/*GET /wordgame/api/v1/sid*/
router.post('/wordgame/api/v2/:userid/:gid/guesses', function(req, res, next) {
	games.find(req.params.userid, req.params.gid, function(err, result) {
		if (err) res.status(200).send(new Error('Could not find the game'));
		var guess = req.query.guess.toLowerCase();
		result.guesses = result.guesses+guess;
		targets.find(result._id, result.userId, function(err2, word) {
			if (word.includes(guess)) {
				for (var i = 0; i < word.length; i++) {
					if (word[i] === guess) {
						result.view = result.view.setCharAt(i, guess);
					}
				}
			} else {
				result.remaining--;
			}
			var done = false;
			if (!result.view.includes('_') || result.remaining == 0) {
				result.status = (!result.view.includes('_')) ? 'victory' : 'loss';
				result.target = word;
				result.timeToComplete = new Date()-result.timestamp;
				done = true;
			}
			games.updateGame(req.params.gid, result, done, function(err3, retRes) {
				if (err3) res.status(200).send(new Error('Could not return updated game'));
				res.status(200).send(retRes);
			});
		});
	});
});

/*grabs the passed defaults object and then matches level and fonts to the corresponding
  Metadata fields creating a matching defaults object withthe given parameters.
  It is then stored into the database under that user profile and the updated default object is returned*/
router.put('/wordgame/api/v2/:userid/defaults', function(req, res, next) {
	var passDef = req.body.defaults;
	for (var k in Metadata.fonts) {
		if (Metadata.fonts[k].family === passDef.font) {
			passDef.font = Metadata.fonts[k];
			break;
		}
	}
	for (var k in Metadata.levels) {
		if (Metadata.levels[k].name === passDef.level) {
			passDef.level = Metadata.levels[k];
			break;
		}
	}
	users.updateDefaults(req.session.user._id, passDef, function(err,result) {
		if (err) res.status(200).send(new Error('Invalid Defaults'));
		res.status(200).send(result.defaults);
	});
});

module.exports = router;
