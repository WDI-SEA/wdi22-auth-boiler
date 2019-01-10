var express = require('express');
var router = express.Router();
var db = require('../models');

router.get('/login', function(req, res){
  res.render('auth/login');
});

router.post('/login', function(req, res){
  res.send(req.body);
});

router.get('/signup', function(req, res){
  res.render('auth/signup', { previousData: null });
});

router.post('/signup', function(req, res){
  if(req.body.password != req.body.password_verify){
    req.flash('error', 'Passwords must match!');
    res.render('auth/signup', { previousData: req.body, alerts: req.flash() });
  }
  else {
    db.user.findOrCreate({
      where: { email: req.body.email },
      defaults: req.body
    })
    .spread(function(user, wasCreated){
      if(wasCreated){
        req.flash('success', 'Yay! Good job! You signed up!');
        res.redirect('/profile');
      }
      else {
        req.flash('error', 'Email already in use!');
        res.render('auth/signup', { previousData: req.body, alerts: req.flash() });
      }
    })
    .catch(function(err){
      if(err && err.errors){
        err.errors.forEach(function(e){
          if(e.type == 'Validation error'){
            req.flash('error', 'Validation Error: ' + e.message);
          }
          else {
            console.log('Error (not validation)', e);
          }
        })
      }

      res.render('auth/signup', { previousData: req.body, alerts: req.flash() });
    });
  }
});

module.exports = router;
