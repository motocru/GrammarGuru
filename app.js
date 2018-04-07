var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var fs = require('fs');
var uuid = require('uuid');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret : 'SEN.BLUTARSKY',
  resave : true,
  saveUninitialized : true,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.redirect('/wordgame');
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log(err);
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
    console.log(err);
		res.send( { msg : err.message } );
	});
}

// error handler
app.use(function(err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.send( { msg : err.message });
});

module.exports = app;
