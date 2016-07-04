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
  var races = require(APPROOT + '/system/races')
  res.render('characters/new', {races:races})
});

router.post('/create',(req,res,next) => {
  console.log("req.body",req.body)
  console.log("req.headers",req.headers)
  if(!req.user) {
    err = new Error();
    err.message = "You must be logged in"
    err.status = 403
    return next(err);
  }

  db.Character.create({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    race: req.body.race,
    sex: req.body.sex
  }).then(pc => {
    return req.user.addCharacter(pc).then((user)=>{
      Common.handleRequest(req,{
        json:() => {return res.send(pc.get({plain:true}))},
        xhr:() => {return res.render('modals/_success', {title: "Character Created", body:"Good job", redirect:'/pc/'+pc.id})},
        default:() => {return res.redirect('/pc/'+pc.id)}
      })();
    })
  }).catch(err => {
    console.error(err)
    return next(err)
  });
});

router.get('/:id',(req,res,next) => {
  db.Character.findOne({where: {id:req.params.id}})
  .then(character => {
    if(!character) return next();
    Common.handleRequest(req,{
      json:() => {return res.send(character.get({plain:true}))},
      xhr:() => {return res.render('characters/detail',{character:character.get({plain:true})})},
      default:() => {return res.render('characters/detail',{character:character.get({plain:true})})}
    })();
  })
  .catch(err => {
    return next(err);
  })
})

router.post('/:id/delete',(req,res,next) => {
  if(!req.user) {
    var err = new Error();
    err.status = 403;
    err.message = "You must be logged in to delete characters"
  }
  db.Character.findOne({where: {id:req.params.id}})
  .then(character => {
    if(!character) {
      var err = new Error();
      err.status = 404;
      err.message = "Character does not exist"
      return err
    }
    if(req.user.hasCharacter(character)) {
      return character.destroy();
    }
    else {
      var err = new Error();
      err.status = 403;
      err.message = "You are not authorized to delete this character"
      return err
    }
  }).then(() => {
    Common.handleRequest(req,{
      json:function(){return res.send(character)},
      xhr:function(){return res.render('modals/_success', {title:"Character Deleted", redirect:"/pc"})},
      default:function() {return res.redirect('/pc')}
    })();
  })
  .catch(err => {
    return next(err);
  })
})

module.exports = router;
