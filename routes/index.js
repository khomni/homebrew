'use strict';

var express = require('express');
var router = express.Router();
var models = require('../models');

var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

// Home Page
// if not logged in, render a splash page
// TODO: Could be a React App if the user is logged in
router.get('/', (req, res, next) => {
  if(req.json) {
    return res.json({
      user: req.user || null,
      character: req.user && req.user.MainChar || null,
      campaign: req.user && req.user.MainChar && req.user.MainChar.Campaign || null
    })
  }
  if(!req.user) return res.redirect('/login');
  res.render('react');
});

router.get('/login',(req,res,next) => {
  if(req.modal) return res.render('users/_login');
  return res.render('users/login');
});

router.post('/login', (req,res,next) => {
  var origin = req.headers.referer || '/';

  passport.authenticate('local', (err,user,info) => {
    if (err) return next(err);
    if (!user) return next(Common.error.request('Invalid Credentials')); 

    req.logIn(user, err => {
      if (err) return next(err);

      if(req.xhr) return res.set('X-Redirect', '/').sendStatus(200);
      return res.redirect('/');
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
      if(req.xhr) return res.set('X-Redirect', '/').sendStatus(302);
      return res.redirect('/');
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

// Convenience Routers!
// If your session also has an active character and campaign, you can route to these to skip permissions

router.use((req,res,next) => {
  if(!req.user) return next();
  res.locals.character = req.user.MainChar;
  if(res.locals.character) res.locals.campaign = res.locals.character.Campaign;
  if(res.locals.campaign) res.locals.breadcrumbs.push({name:res.locals.campaign.name, url: res.locals.campaign.url});
  if(res.locals.character) res.locals.breadcrumbs.push({name:res.locals.character.name, url: '/status'});
  return next();
})

router.use('/', require('./character/character-router'));

router.use('/s', require('./system'));

router.use('/settings',require('./settings'));


module.exports = router;
