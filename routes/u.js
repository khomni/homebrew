var express = require('express');
var router = express.Router();
var db = require('../models');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', (req, res, next) => {
  var users = db.User.findAll({})
  .then( users => {
    console.log("[5.0] ACCESSING AFTER CREATION")
    for(i=0;i<users.length;i++){
      console.log(" [5."+i+"] user instance: ", users[i].get({plain:true}))
    }
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
});

router.post('/login', (req,res,next) => {
  var origin = req.headers.referer || '/';
  console.log(req.body)
  passport.authenticate('local',(err,user,info) => {
    if (err) {
      console.error('[Log in] ', err);
      return next(err);
    };
    debugger;
    if (!user) {
      console.log('[Log in] no user found')
      return res.redirect(origin);
    };
    console.log('[Log in] logging in user...')
    req.logIn(user, err => {
      if (err) {
        return next(err)
      };
      console.log("[Log in] as user: ", req.user.get({plain:true}));
      return res.redirect(origin);
    })
  })(req, res, next)
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
      if (err) {
        console.error(err);
        return next(err);
      };
      console.log("[Log in] as user: ", req.user.get({plain:true}));
      return res.redirect(origin);
    })
  })
  .catch(err => next(err));
});

router.get('/logout',(req,res,next) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
