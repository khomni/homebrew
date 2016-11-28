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
