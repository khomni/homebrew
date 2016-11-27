'use strict'

var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', (req, res, next) => {
  var users = db.User.findAll({})
  .then( users => {
    res.render('users/', {users:users})
  })
  .catch(err => next(err));
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

router.get('/logout',(req,res,next) => {
  req.logout();
  return res.redirect('/');
});

router.get('/:username',(req,res,next) => {
  db.User.findOne({where: {username:req.params.username}, include:[{model: db.Character, as: 'characters'},{model: db.Character, as: 'MainChar'}]})
  .then(user => {
    if(!user) return next();
    return res.render('users/profile',{user:user,mainchar:user.MainChar, characters:user.characters})
  }).catch(next);
});

module.exports = router;
