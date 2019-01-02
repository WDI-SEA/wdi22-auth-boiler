// Requires
var express = require('express');

// Declare express app
var app = express();

// Declare a refernce to the models folder
var db = require('./models');

// Set views to EJS
app.set('view engine', 'ejs');

// Declare routes
app.get('/', function(req, res){
  db.movie.findAll()
  .then(function(foundMovies){
    res.render('home', { foundMovies: foundMovies });
  })
  .catch(function(err){
    console.log('Error Message', err);
    res.send('Error, check your logs');
  });
});

// Listen on a port
app.listen(3000);
