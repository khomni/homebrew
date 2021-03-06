'use strict';

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
  if(req.modal) return res.render('users/_login');
  return res.render('users/login');
});

router.post('/login', (req,res,next) => {
  var origin = req.headers.referer || '/';

  passport.authenticate('local',(err,user,info) => {
    if (err) return next(err);
    if (!user) return next(Common.error.request('Invalid Credentials')); 

    req.logIn(user, err => {
      if (err) return next(err);
      return res.redirect(origin);
    })
  })(req, res, next)
});

router.use('/logout',(req,res,next) => {
  req.logOut();
  req.session.destroy(()=>{
    res.clearCookie('Session');
    return res.redirect('/');
  })
});

router.get('/signup',(req,res,next)=>{
  if(req.modal) return res.render('users/_signup');
  return res.render('users/signup');
});

router.post('/signup', (req,res,next) => {
  var origin = req.headers.referer || '/';
  var user = db.User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  },{fields:['username','email','password']})
  .then(user => {
    req.logIn(user, err => {
      if(req.xhr) return res.set('X-Redirect', user.url).sendStatus(302);
      return res.redirect(origin);
    })
  })
  .catch(next);
});

router.get('/about', (req, res, next) => {
  res.render('about');
});

router.use('/i', require('./images'));

router.use('/u', require('./user'));
router.use('/pc', require('./character'));
router.use('/r', require('./reference'));
router.use('/c', require('./campaign'));
router.use('/lore', require('./lore'));
router.use('/knowledge', require('./character/knowledge'));
router.use('/comment', require('./comment'));

router.use('/s', require('./system'));

router.use('/settings',require('./settings'));


module.exports = router;
