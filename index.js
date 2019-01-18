// Load up env variables
require('dotenv').config();

// Requires
var flash = require('connect-flash');
var express = require('express');
var layouts = require('express-ejs-layouts');
var parser = require('body-parser');
var passport = require('./config/passportConfig');
var session = require('express-session');

// Declare express app
var app = express();

// Declare a refernce to the models folder
var db = require('./models');

// Set views to EJS
app.set('view engine', 'ejs');

// Use Middleware
app.use(layouts);
app.use('/', express.static('static'));
app.use(parser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Custom middleware - write data to locals
app.use(function(req, res, next){
  res.locals.alerts = req.flash();
  res.locals.user = req.user;
  next();
});

// Declare routes
app.get('/', function(req, res){
  res.render('home');
});

// Include any controllers we need
app.use('/auth', require('./controllers/auth'));
app.use('/profile', require('./controllers/profiles'));

// Listen on a port
app.listen(process.env.PORT || 3000, function(){
  console.log('Hello world!');
});
