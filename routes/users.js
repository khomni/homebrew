var express = require('express');
var router = express.Router();
var models = require('../models');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', (req, res, next) => {
  var users = models.User.findAll({})
  .then( users => {
    console.log(users)
    res.render('users/', {users:users})
  })
  .catch(err => next(err));
});

router.get('/_login',(req,res,next)=>{
  res.render('users/_login');
});

router.get('/_signup',(req,res,next)=>{
  res.render('users/_signup');
});

router.post('/create', (req,res,next) => {
  console.log(req.body);
  var user = models.User.create({
    username: req.body.username,
    email: req.body.email,
  })
  .then(user => {
    console.log('[model.User]', user)
    res.render('/'+user.id,{user: user})
  })
  .catch(err => next(err));
})

router.post('/login', (req,res,next) => {
  var origin = req.headers.referer
  console.log(req.headers)
  console.log("ORIGIN: ", origin)
  res.redirect(origin)
})

module.exports = router;
