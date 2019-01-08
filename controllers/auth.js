var express = require('express');
var router = express.Router();

router.get('/login', function(req, res){
  res.render('auth/login');
});

router.post('/login', function(req, res){
  res.send(req.body);
});

router.get('/signup', function(req, res){
  res.render('auth/signup');
});

router.post('/signup', function(req, res){
  if(req.body.password != req.body.password_verify){
    req.flash('error', 'Passwords must match!');
    res.redirect('/auth/signup');
  }
  else {
    res.send(req.body);
  }
});


module.exports = router;
