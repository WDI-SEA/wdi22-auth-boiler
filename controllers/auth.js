var express = require('express');
var passport = require('../config/passportConfig');
var router = express.Router();
var db = require('../models');

router.get('/login', function(req, res){
  res.render('auth/login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  successFlash: 'Yay, login successful!',
  failureRedirect: '/auth/login',
  failureFlash: 'Invalid Credentials'
}));

router.get('/signup', function(req, res){
  res.render('auth/signup', { previousData: null });
});

router.post('/signup', function(req, res, next){
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
        passport.authenticate('local', {
          successRedirect: '/profile',
          successFlash: 'Yay, login successful!',
          failureRedirect: '/auth/login',
          failureFlash: 'Invalid Credentials'
        })(req, res, next);
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

router.get('/logout', function(req, res){
  req.logout(); // logs me out of the session
  req.flash('success', 'Successful Logout! Come back again!');
  res.redirect('/');
});

/* FACEBOOK SPECIFIC ROUTES */
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

router.get('/callback/facebook', passport.authenticate('facebook', {
  successRedirect: '/profile',
  successFlash: 'Facebook login successful',
  failureRedirect: '/auth/login',
  failureFlash: 'Oops, Facebook has failed you.'
}));

module.exports = router;
