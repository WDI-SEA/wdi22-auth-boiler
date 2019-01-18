module.exports = function(req, res, next){
  if(req.user){
    next();
  }
  else {
    req.flash('error', 'Please login to access this page!');
    res.redirect('/auth/login');
  }
}
