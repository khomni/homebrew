var express = require('express');
var router = express.Router();
var db = require('../models');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', (req, res, next) => {
  var characters = db.Character.findAll({})
  .then( characters => {
    for(i=0;i<characters.length;i++){
      console.log(characters[i].get({plain:true}))
    }
    res.render('characters/', {characters:characters})
  })
  .catch(err => next(err));
});

router.get('/create', (req, res, next) => {
  if(!req.user) {
    err = new Error();
    err.message = "You must be logged in"
    err.status = 403
    return next(err);
  }
  var races = require(appRoot + '/system/races')
  res.render('characters/new', {races:races})
});

router.post('/create',(req,res,next) => {
  if(!req.user) {
    err = new Error();
    err.message = "You must be logged in"
    err.status = 403
  }
  var pc = db.Character.create({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    race: req.body.race,
    sex: req.body.sex
  }).then(pc => {
    console.log("PC:",pc)
    return req.user.addCharacter(pc)
  }).finally(() => {
    return res.redirect('/pc/');
  }).catch(err => {
    console.error(err)
    return next(err)
  });
})

router.post('/create', (req,res,next) => {
  console.log(req.body);
});

router.get('/:id',(req,res,next) => {
  db.Character.findOne({where: {id:req.params.id}})
  .then(character => {
    if(!character) return next();
    return res.render('characters/detail',{character:character.get({plain:true})})
  })
  .catch(err => {
    return next(err);
  })
})

module.exports = router;
