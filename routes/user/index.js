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

var userRouter = express.Router({mergeParams: true});

router.use('/:username',(req,res,next) => {
  return db.User.findOne({where: {username:req.params.username}, include:[{model: db.Character, as: 'characters'},{model: db.Campaign}]})
  .then(user => {
    if(!user) throw Common.error.notfound('User');
    res.locals.user = user
    res.locals.breadcrumbs.push({name:user.username,url:req.baseUrl})
    return next();
  }).catch(next);
},userRouter);

userRouter.get('/', (req,res,next) => {

  if(req.json) return res.json(res.locals.user)
  return res.render('users/profile',{mainchar:res.locals.user.MainChar, characters:res.locals.user.characters})
});

userRouter.use('/pc',require('../character'));
userRouter.use('/c',require('../campaign'));

module.exports = router;
