var express = require('express');
var router = express.Router();
var models = require('../models');

var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/login',(req,res,next)=>{
  if(req.requestType('modal')) return res.render('users/_login');
  return res.render('users/login');
});

router.post('/login', (req,res,next) => {
  var origin = req.headers.referer || '/';
  passport.authenticate('local',(err,user,info) => {
    if (err) return next(err);
    if (!user) {
      // TODO: indicate login failure
      return res.redirect(origin);
    }

    req.logIn(user, err => {
      if (err) return next(err);
      return res.redirect(origin);
    })
  })(req, res, next)
});

router.get('/signup',(req,res,next)=>{
  if(req.requestType('modal')) return res.render('users/_signup');
  return res.render('users/signup');
});

router.post('/signup', (req,res,next) => {
  var origin = req.headers.referer || '/';
  var user = db.User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })
  .then(user => {
    req.logIn(user, err => {
      console.log("[Log in] as user: ", req.user.get({plain:true}));
      return res.redirect(origin);
    })
  })
  .catch(next);
});

router.get('/about', (req, res, next) => {
  res.render('about');
});

router.use('/u',require('./user'));
router.use('/pc',require('./character'));
router.use('/r',require('./reference'));
router.use('/c',require('./campaign'));

module.exports = router;
