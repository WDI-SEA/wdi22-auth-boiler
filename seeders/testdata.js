var db = require('../models');

db.movie.create({
  title: 'Die Hard',
  year: 1988,
  genre: 'Christmas',
  runtime: 110,
  tagline: 'Yippie Kai-ye...'
})
.then(function(createdMovie){
  console.log('Successfullly created movie', createdMovie.title);
})
.catch(function(err){
  console.log('ERROR', err);
});
