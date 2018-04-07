/*modalState variable houses the current game and the sid*/
var modalState = {
	game: null,
	csrf : null,
	page : {pages : ["login", "game", "table", "editModal"], page : null},
	user : null	
};

/*===============================DOM FUNCTIONS==========================*/
/*function that launches when the website starts up*/
$(document).ready(function () {
	$('#editModal').hide();
	//showModal(null);
	//startUp();
	setPage('login');
});

function showModal(game) {
	if (game) {
		populateModal(null);
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
		$('#table').slideUp();
		$('#tabBody').slideUp();
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
		$('#table').slideDown();
		$('#tabBody').slideDown();
		$("#guesses").remove();
		$(".flavor").remove();
		$('#letterModal').remove();
		$('#guessBtn').remove();
		$('#curr_game').css('color', '#000000').css('font-family', 'Arial');
		$('#editWell').css('background', '#f5f5f5');
	}
}

function showUser(user) {
	if (user) {
		modalState.game = user;
		$('#editModal').slideDown();
		$('#game').slideUp();
		$('#table').slideUp();
		$('#tabBody').slideUp();
		populateModal(user);
	} else {
		populateModal(null);
		$('#editModal').slideUp();
		$('#game').slideDown();
		$('#table').slideDown();
		$('#tabBody').slideDown();
	}
}

function setPage(page) {
	modalState.page.page = page;
	var dispArr = ['font_box', 'diff_box', 'col3_box', 'col2_box', 'col1_box', 
	'defaulter', 'search', 'searchBut', 'refresh'];
	if (page == 'login') {
		$('body').addClass('background');
	} else {
		$('body').removeClass('background');
	}
	var addresser = '';
	if (page == 'game') {
		addresser = 'Current Ring Bearer';
		$('#player').remove();
		showModal(null);
		displayGameBar(dispArr);
		startUp();
	}
	if (page == 'admin') {
		addresser = 'Current Admin';
		$('#player').remove();
		showModal(null);
		startUp();
		hidden(dispArr);
	}
	modalState.page.pages.forEach( p => {
		var selector = '#' + p;
		modalState.page.page == p ? $(selector).show() : $(selector).hide();
	});
	//if (page == 'admin') $('game').hide();
	if (page == 'game' || page == 'admin') {
		$(`<h1 id="player" class="title">${addresser}: ${modalState.user.name.first+" "+modalState.user.name.last}</h1>`).prependTo('#game');
		$('#table').show();
	}
}
/*sets the user for the modalState and then passes game or login to the setPage
  method to display information associated with the user that signed in, or remain at the login screen*/
function setUser(user) {
	modalState.user = user;
	if (!user) setPage('login');
	else setPage((user.role === 'USER') ? 'game' : 'admin');
}

//hides some selected fields on the navbar that shouldn't be up for the admin
//also places admin based headers onto the table
function hidden(arr) {
	for (var i = 0; i < arr.length; i++) {
		var selector = '#'+arr[i];
		$(selector).hide();
	}
	$('#search').show();
	$('#searchBut').show();
	$('#refresh').show();
	$('#play').text('Add User');
	tableHeaders(['first-name', 'last-name', 'email', 'role', 'enabled']);
}
//shows features of the game bar that might have been removed from admins logging in
//also displays the correct user headers on the website
function displayGameBar(arr) {
	for (var i = 0; i < arr.length; i++) {
		var selector = '#'+arr[i];
		$(selector).show();
	}
	$('#search').hide();
	$('#searchBut').hide();
	$('#refresh').hide();
	$('#play').text('New Game');
	tableHeaders(['Level', 'Phrase', 'Remaining', 'Answer', 'Status']);
}

function tableHeaders(headers) {
	for (var i = 0; i < headers.length; i++) {
		var selector = '#h'+i;
		$(selector).text(headers[i]);
	}
}

function populateModal(user) {
	if (user) {
		$('.useLab').show();
		$('#fname').show().val(user.name.first);
		$('#lname').show().val(user.name.last);
		$('#email').show().val(user.email);
		$('#roles').show().val(user.role);
		$('#useCEdit').show();
		$('.checkbox').show();
		(user.enabled == true) ? $('#enabled').prop("checked", true) : $('#enabled').prop("checked", false);
		editable(user);
	} else {
		$('#useCEdit').hide();
		$('.checkbox').hide();
		$('.useLab').hide();
	}
}

function editable(user) {
	if (user.email != '') {
		$('#fname').prop('disabled', true);
		$('#lname').prop('disabled', true);
		$('#email').prop('disabled', true);
		$('#newPassLab').hide();
		$('#userBtn').text('Update');
		if (user.email === modalState.user.email) {
			$('#roles').prop('disabled', true);
			$('#enabled').prop('disabled', true);
		} else {
			$('#roles').prop('disabled', false);
			$('#enabled').prop('disabled', false);
		}
	} else {
		$('#fname').prop('disabled', false);
		$('#lname').prop('disabled', false);
		$('#email').prop('disabled', false);
		$('#roles').prop('disabled', false);
		$('#enabled').prop('disabled', false);
		$('#newPassLab').show();
		$('#userBtn').text('Create');
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
	$('#editWell').css('background', '#f5f5f5');
}

/*shows the proper gif at the end of a given game*/
function endDisplay(status) {
	$('#guesses').remove();
	if (status === 'loss') {
		$('#editWell').css({'background' : 'url(cry.gif) repeat'});
	} else {
		$('#editWell').css({'background' : 'url(winner.gif) repeat'});
	}
}

/*makes a row and places that row into the table. Also calles the makeView function
  to dynamically create and update the view of that specific game*/
function makeRow(game, ans) {
	return $(`<tr id="${game._id}" class="clickable"><td>${game.level.name}</td>
		<td>${makeView(game.view, game._id)}</td>
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
	games.forEach(game => {
		var ans = (game.target === undefined) ? '' : game.target;
		var tr = makeRow(game, ans);
		tr.appendTo(tabBody);
		tr.click(function() {
			getGame(game._id);
		});
		$(`.${game._id}`).css({
			'color' : game.colors.textBackground,
			'background-color' : game.colors.wordBackground,
			'font-family' : game.font.family
		});
	});
}

function createUserTable(users) {
	$('#tabBody').empty();
	users.forEach(user => {
		var tr = makeUserRow(user);
		tr.appendTo(tabBody);
		tr.click(function() {
			getUser(user._id);
		});
	});
}

function makeUserRow(user) {
	return $(`<tr id="$user._id}" class="clickable"><td>${user.name.first}</td>
		<td>${user.name.last}</td>
		<td>${user.email}</td><td>${user.role}</td><td>${user.enabled}</td></tr>`);
}

/*gathers the information from the meta that needs to be placed into the html dynamically for it 
  to work. Defaults are also set here as well.*/
function prepMetaDefaults(meta) {
	/*first loop appends the difficulty levels*/
	/*first we need to empty the difficulty and font list so we dont have duplicates from signing in*/
	$('#diffs').empty();
	$('#fonts').empty();
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
	setUserDefaults(modalState.user.defaults);
}

function setUserDefaults(defaults) {
	/*default level*/
	$('#diffs').val(defaults.level.name);
	/*assigning default colors*/
	$('#word_color').val(defaults.colors.wordBackground);
	$('#guess_color').val(defaults.colors.guessBackground);
	$('#fore_color').val(defaults.colors.textBackground);
	/*default font*/
	$('#fonts').val(defaults.font.family);
}

function inpVal(email, pass, user) {
	if (!email.includes('@')) {
		alert('Your email does not contain the @ symbol');
		return false;
	}
	var local = email.split(/@/)[0];
	if (local.length < 1) {
		alert('You did not give a local segment in your email');
		return false;
	}
	if (local.match(/[$#!\?'*&:;<>()\|{}~`'"+=\-_/ ]+/gi)) {
		alert("no special characters are allowed in the local portion of the email address.");
		return false;
	}
	var domain = email.split(/@/)[1];
	if (!domain.match(/[a-zA-Z0-9]([a-zA-Z0-9\-])*\.[a-zA-Z0-9]/gi)) {
		alert('your given email domain does not match email domain standards');
		return false;
	}

	if (!pass.match(/[0-9]/gi)) {
		alert('Your password must contain at least 1 digit');
		return false;
	}
	if (user) {
		if (user.name.first.match(/[0-9\*\-_$#!@'&:;<>()\|`+=']/gi) || user.name.last.match(/[0-9\*\-_$#!@'&:;<>()\|`+=']/gi)){
			alert('You cannot place special characters in the name fields');
			return false;
		}
		if (user.name.first.length < 1) {
			alert('The first name field is empty');
			return false;
		}
		if (user.name.last.length < 1) {
			alert('The last name field is empty');
			return false;
		}
	}
	return true;
}

/*closes the game-view modal*/
function cancel() {
	if (modalState.user.role === 'USER')showModal(null);
	else showUser(null);
}

function create() {
	if (modalState.user.role === 'ADMIN') {
		showUser(new User('', '', null, 'USER', '', '', false));
	}
	else createGame();
}

function credit() {
	if ($('#userBtn').text() === 'Update') {
		updateUser();
	} else {
		createUser();
	}
}

function searchUsers() {
	userList($('#search').val());
	$('#search').val('');
}

/*a second set of server side functions are placed here. This was due to problems sending functions
  from the client side as the only definition of them were on the server side.*/
function Colors (guess, text, word) {
	this.guessBackground = guess;
	this.textBackground = text;
	this.wordBackground = word;
}

function Defaults (colors, font, level) {
	this.colors = colors;
	this.font = font;
	this.level = level;
}

function User(email, password, defaults, role, fname, lname, enabled) {
	this.email = email;
	this.password = password;
	this.defaults = defaults;
	this.role = role;
	this.name = {first : fname, last : lname};
	this.enabled = enabled;
}

/*==============================AJAX=====================================*/

function login(evt) {
	evt.preventDefault();
	var password = $('#login_password').val();
	var email = $('#login_email').val();
	/*clear the values for login and email before checking if what's given is valid*/
	$('#login_password').val('');
	$('#login_email').val('');
	if (!inpVal(email, password, null)) return;

	$.ajax( {
		url: 'wordgame/api/v3/login',
		method: 'POST',
		data: {'email' : email, 'password' : password},
		success: function(data, status, xhr) {
			setUser(data);
			modalState.csrf = xhr.getResponseHeader('X-CSRF');
		},
		error: (message) => alert(message.msg)
	});
};

function logout(event) {
	$.ajax( {
		url: 'wordgame/api/v3/logout',
		method: 'POST',
		success: () => {setUser(null); modalState.csrf = null;}
	});
};

/*selects the colors, font and difficulty and creates a new game using that information
  updates the table and brings up modal when returned*/
function createGame() {
	var diff = $('#diffs').val();
	var font = $('#fonts').val();
	var colors = new Colors($('#guess_color').val(), $('#fore_color').val(), $('#word_color').val());

	$.ajax( {
		url: 'wordgame/api/v3/'+modalState.user._id+'?level='+diff,
		method: 'POST',
		headers: { 'X-font' : font, 'X-CSRF' : modalState.csrf },
		data : { colors : colors },
		success: (game) => {showModal(game); gameList();},
		error : () => setUser(null)
	});
};

/*grabs the list of games in the session*/
function gameList() {
	$.ajax( {
		url: 'wordgame/api/v3/'+modalState.user._id,
		method: 'GET',
		headers : {'X-CSRF' : modalState.csrf},
		success: (gameList) => {createTable(gameList);},
		error : () => setUser(null)
	});
};

function createUser() {
	var newUser = new User($('#email').val(), $('#newPass').val(), null, $('#roles').val(), 
		$('#fname').val(), $('#lname').val(), $('#enabled').prop('checked'));
	if (!inpVal(newUser.email, newUser.password, newUser)) return;
	$.ajax({
		url: 'wordgame/api/v3/admins/'+modalState.user._id,
		method: 'POST',
		data : {newUser : newUser},
		headers: {'X-CSRF': modalState.csrf},
		success: (newUser) => {getUser(newUser._id); userList('');},
		error: () => setUser(null)
	});
};

function userList(filter) {
	$.ajax({
		url: 'wordgame/api/v3/admins/'+modalState.user._id+'/users?filter='+filter,
		method: 'GET',
		headers: {'X-CSRF' : modalState.csrf},
		success: (userList) => {createUserTable(userList);},
		error: () => setUser(null)
	});
};

function getUser(uid) {
	$.ajax({
		url: 'wordgame/api/v3/admins/'+modalState.user._id+'/'+uid,
		method: 'GET',
		headers : {'X-CSRF' : modalState.csrf},
		success: (user) => {showUser(user)},
		error : () => setUser(null)
	});
};

function updateUser() {
	var newRole = $('#roles').val()
	var newEnab = $('#enabled').prop('checked');
	$.ajax({
		url: 'wordgame/api/v3/admins/'+modalState.user._id+'/'+modalState.game._id,
		method: 'PUT',
		data: {role : newRole, enabled : newEnab},
		headers : {'X-CSRF' : modalState.csrf},
		success: (user) => {showUser(user); userList('');},
		error : () => setUser(null)
	});
};

/*gets the specific game using a game id*/
function getGame(gid) {
	$.ajax({
		url: 'wordgame/api/v3/'+modalState.user._id+'/'+gid,
		method: 'GET',
		headers : {'X-CSRF' : modalState.csrf},
		success: (game) => {showModal(game);},
		error : () => setUser(null)
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
		url: 'wordgame/api/v3/meta',
		method: 'GET',
		success: (meta) => {prepMetaDefaults(meta); showModal(null); 
			if (modalState.user.role == 'USER')gameList();
			else userList('');}
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
		url: 'wordgame/api/v3/'+modalState.user._id+'/'+modalState.game._id+'/guesses?guess='+guess,
		method: 'POST',
		headers : {'X-CSRF' : modalState.csrf},
		success: (game) => {showModal(game); gameList();},
		error : () => setUser(null)
	});
};

/*collects the infor from the current settings that are in place and then passes that information to the 
  server. Upon return, the defaults are placed in as a precaution to double check everything is done correctly*/
function defaultChange() {
	var diff = $('#diffs').val();
	var font = $('#fonts').val();
	var colors = new Colors($('#guess_color').val(), $('#fore_color').val(), $('#word_color').val());
	var def = new Defaults(colors, font, diff);

	$.ajax( {
		url: 'wordgame/api/v3/'+modalState.user._id+'/defaults',
		method: 'PUT',
		data : {defaults : def},
		headers : {'X-CSRF' : modalState.csrf},
		success : (defaults) => {setUserDefaults(defaults);},
		error : () => setUser(null)
	});
};