/*modalState variable houses the current game and the sid*/
var modalState = {
	game: null,
	sid: null	
};

/*===============================DOM FUNCTIONS==========================*/
/*function that launches when the website starts up*/
$(document).ready(function () {
	showModal(null);
	startUp();
});

function showModal(game) {
	if (game) {
		modalState.game = game;
		if (game.status === 'unfinished') {
			$('#guesses').remove();
			playDisplay();
			guessAppender().prependTo(guess_inp);
		} else {
			endDisplay(game.status);
		}
		$('#editModal').slideDown();
		$('#game').slideUp();
		$('.flavor').remove();
		guessList(game);
		for (k in game.view) {
			wordAppender(game.view[k], game).appendTo(curr_game);
		}
		$('#curr_game').css('color',game.colors.textBackground);
		$('#curr_game').css('font-family', game.font.family);
	} else {
		$('#editModal').slideUp();
		$('#game').slideDown();
		$("#guesses").remove();
		$(".flavor").remove();
		$('#letterModal').remove();
		$('#guessBtn').remove();
	}
}

/*prepends the remaining guesses in front of the guess button in the game-view modal*/
function guessAppender() {
	return $(`<label for="letterModal" id="guesses">${modalState.game.remaining} guesses remaining</label>`);
}

/*appends the current word view to the game-view modal*/
function wordAppender(letter, game) {
	return $(`<h1 class="flavor" style="background-color:${game.colors.wordBackground};">${letter.toUpperCase()}</h1>`);
}

/*Appends the different option values to the select elements in the html file
 done for both the fonts and the difficulties in html file*/
function optionAppender(opt) {
	return $(`<option value="${opt}">${opt}</option>`);
}

/*appends all the guesses that were made on the word*/
function guessList(game) {
	for (var k in game.guesses) {
		$(`<h2 class="flavor">${game.guesses[k].toUpperCase()}</h2>`).appendTo(guessed);
		$('h2.flavor').css({'color' : game.colors.textBackground, 'background-color': game.colors.guessBackground});
	}
}

/*places the char input box and guess button on the modal. Also clears the background image
  if any existed from a win or loss state on a previous game*/
function playDisplay() {
	$('<input type="text" id="letterModal" maxlength="1" minlength="1" class="form-control"/>').appendTo(guess_inp);
	$('<span onClick="guess()" class="btn btn-sm btn-primary" id="guessBtn">Guess</span>').appendTo(guess_inp);
	$('#editWell').css('background-image', 'none');
}

/*shows the proper gif at the end of a given game*/
function endDisplay(status) {
	$('#guesses').remove();
	if (status === 'loss') {
		$('#editWell').css({'background-image' : 'url(cry.gif)', 'background-size' : 'cover'});
	} else {
		$('#editWell').css({'background-image' : 'url(winner.gif)', 'background-size' : 'cover'});
	}
}

/*makes a row and places that row into the table. Also calles the makeView function
  to dynamically create and update the view of that specific game*/
function makeRow(game, ans) {
	return $(`<tr id="${game.id}" class="clickable"><td>${game.level.name}</td>
		<td>${makeView(game.view, game.id+1)}</td>
		<td>${game.remaining}</td><td>${ans.toUpperCase()}</td><td>${game.status}</td></tr>`);
}

/*loops through the characters in a view and returns the formatted h1 tag that will be placed in the 
  table row*/
function makeView(view, id) {
	var result = '';
	for (var k in view) {
		result = result+`<h1 class="form ${id}">${view[k].toUpperCase()}</h1>`;
	}
	return result;
}

/*first clears the current table and then loops over each of the games inside of the object array
  creates a row and appends that to the table for each entry.
  Each entry is made clickable in JQuery and lastly, the CSS is applied to the page.*/
function createTable(games) {
	$('#tabBody').empty();
	Object.keys(games).forEach(function(k) {
		var ans = (games[k].target === undefined) ? '' : games[k].target;
		var tr = makeRow(games[k], ans);
		tr.appendTo(tabBody);
		tr.click(function() {
			getGame(games[k].id);
		});
		$(`.${games[k].id+1}`).css({
			'color' : games[k].colors.textBackground,
			'background-color' : games[k].colors.wordBackground,
			'font-family' : games[k].font.family
		});
	});
}

/*gathers the information from the meta that needs to be placed into the html dynamically for it 
  to work. Defaults are also set here as well.*/
function prepMetaDefaults(meta) {
	/*first loop appends the difficulty levels*/
	for (var k in meta.levels) {
		var p = optionAppender(meta.levels[k].name);
		p.appendTo(diffs);
	}
	/*fonts families are placed into a list and then sorted befotre being added to the font selection*/
	var sortFontList = [];
	for (var k in meta.fonts) {
		$('head').append(`<link href="${meta.fonts[k].url}" rel="stylesheet">`);
		sortFontList.push(meta.fonts[k].family);
	}
	sortFontList.sort();
	for (var k in sortFontList) {
		var p = optionAppender(sortFontList[k]);
		p.appendTo(fonts);
	}
	/*default level*/
	$('#diffs').val(meta.defaults.level.name);
	/*assigning default colors*/
	$('#word_color').val(meta.defaults.colors.wordBackground);
	$('#guess_color').val(meta.defaults.colors.guessBackground);
	$('#fore_color').val(meta.defaults.colors.textBackground);
	/*default font*/
	$('#fonts').val(meta.defaults.font.family);
}

/*closes the game-view modal*/
function cancel() {
	showModal(null);
}

/*a second colors function was placed here. This was due to problems trying to send a colors function
  from the client side as the only definition of the colors function was on the server side.*/
function Colors (guess, text, word) {
	this.guessBackground = guess;
	this.textBackground = text;
	this.wordBackground = word;
}

/*==============================AJAX=====================================*/

/*selects the colors, font and difficulty and creates a new game using that information
  updates the table and brings up modal when returned*/
function createGame() {
	var diff = $('#diffs').val();
	var font = $('#fonts').val();
	var colors = new Colors($('#guess_color').val(), $('#fore_color').val(), $('#word_color').val());

	$.ajax( {
		url: 'wordgame/api/v1/'+modalState.sid+'?level='+diff,
		method: 'POST',
		headers: { 'X-font' : font },
		data : { colors : colors },
		success: (game) => {showModal(game); gameList();}
	});
};

/*creates a new SID*/
function createSID() {
	$.ajax( {
		url: 'wordgame/api/v1/sid',
		method: 'GET',
		success: (sid) => {modalState.sid = sid;}
	});
};

/*grabs the list of games in the session*/
function gameList() {
	$.ajax( {
		url: 'wordgame/api/v1/:'+modalState.sid,
		method: 'GET',
		success: (gameList) => {createTable(gameList);}
	});
};

/*gets the specific game using a game id*/
function getGame(gid) {
	$.ajax({
		url: 'wordgame/api/v1/:'+modalState.sid+'/:'+gid,
		method: 'GET',
		success: (game) => {showModal(game);}
	});
};

/*fucntion called when the page initially loads*/
function startUp() {
	$.ajax( {
		url: 'wordgame',
		method: 'GET',
		success: getMeta()
	});
};

/*collects the Metadata from the server*/
function getMeta() {
	$.ajax ( {
		url: 'wordgame/api/v1/meta',
		method: 'GET',
		success: (meta) => {prepMetaDefaults(meta); showModal(null); createSID();}
	});
};

/*function collects the guess a player makes and then updates the view, the table and the current game*/
function guess() {
	var guess = $('#letterModal').val();
	if (modalState.game.guesses.includes(guess)) {
		alert('Invalid guess, already guessed');
		return;
	}
	$('#letterModal').remove();
	$('#guessBtn').remove();
	$.ajax ({
		url: 'wordgame/api/v1/:'+modalState.sid+'/:'+modalState.game.id+'/guesses?guess='+guess,
		method: 'POST',
		success: (game) => {showModal(game); gameList();}
	});
};