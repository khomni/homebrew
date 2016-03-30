var express = require('express');
var router = express.Router();
var models = require('../models');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/create', function(req,res,next){
  console.log(req.body);
  var user = models.User.create({
    username: req.body.username,
    email: req.body.email,
  })
  .then(function(user){
    console.log('[model.User]', user)
    res.render('/'+user.id,{user: user})
  })
  .catch(function(err) {
    next(err);// Ooops, do some error-handling
  })
})

router.post('/login', function(req,res,next){
  passport.authenticate('local',function(err,user,info){

  })
})

module.exports = router;
