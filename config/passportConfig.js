// Include environment variables
require('dotenv').config();

// Require passport module and any strategies you wish to use
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// A reference to our models
var db = require('../models');

// Provide serialize/deserialize functions so we can store user in session
passport.serializeUser(function(user, callback){
  // callback(errorMessage, userData)
  callback(null, user.id);
});

passport.deserializeUser(function(id, callback){
  db.user.findByPk(id)
  .then(function(user){
    callback(null, user);
  })
  .catch(function(err){
    callback(err, null);
  });
});

// Do the actual logging in (authentication)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, function(email, password, callback){
  db.user.findOne({
    where: { email: email }
  })
  .then(function(foundUser){
    // if I didn't find a valid user or that user's password, once hashed, doesn't match the hash in the db
    if(!foundUser || !foundUser.validPassword(password)){
      // bad
      callback(null, null);
    }
    else {
      // good
      callback(null, foundUser);
    }
  })
  .catch(function(err){
    callback(err, null);
  });
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FB_APP_ID,
  clientSecret: process.env.FB_APP_SECRET,
  callbackURL: process.env.BASE_URL + '/auth/callback/facebook',
  profileFields: ['id', 'email', 'displayName', 'photos'],
  enableProof: true
}, function(accessToken, refreshToken, profile, callback){
  // See if FB gave us an email to identify the user with
  var facebookEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

  // See if the email exists in the users table
  db.user.findOne({
    where: { email: facebookEmail }
  })
  .then(function(existingUser){
    if(existingUser && facebookEmail){
      // This is a returning user - just need to update facebookId and Token
      existingUser.updateAttributes({
        facebookId: profile.id,
        facebookToken: accessToken
      })
      .then(function(updatedUser){
        callback(null, updatedUser);
      })
      .catch(callback);
    }
    else {
      // This person is a new user, so we need to create them
      var usernameArr = profile.displayName.split(' ');
      var photo = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : 'https://png.icons8.com/ios/1600/person-female-filled.png';

      db.user.findOrCreate({
        where: { facebookId: profile.id },
        defaults: {
          facebookToken: accessToken,
          email: facebookEmail,
          firstname: usernameArr[0],
          lastname: usernameArr[usernameArr.length - 1],
          admin: false,
          dob: profile.birthday,
          image: photo
        }
      })
      .spread(function(newUser, wasCreated){
        if(wasCreated){
          // This was expected, yay
          callback(null, newUser);
        }
        else {
          // newUser was not new after all. This might happen if
          // they changed their email on file with facebook since they logged in last.
          // NOTE: save() is an alternative way of doing updateAttributes()
          newUser.facebookToken = accessToken;
          newUser.email = facebookEmail;
          newUser.save()
          .then(function(savedUser){
            callback(null, savedUser)
          })
          .catch(callback);
        }
      })
      .catch(callback);
    }
  })
  .catch(callback);
}));

// Make sure I can include this module in other pages in my app
module.exports = passport;
