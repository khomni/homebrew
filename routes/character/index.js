var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  if(!req.user) return next();
  db.Character.findAll({
    where: {UserId: req.user.id},
    include: [
      {model: db.Lore, as: 'lore'},
    ],
  })
  .then( characters => {
    res.render('characters/', {characters:characters})
  })
  .catch(next);
});

router.post('/',(req,res,next) => {
  if(!req.user) {
    err = new Error();
    err.message = "You must be logged in"
    err.status = 403
    return next(err);
  }

  console.log(req.body)

  var character = db.Character.create({
    npc: false,
    name: req.body.name,
    race: req.body.race,
    sex: req.body.sex,
    CampaignId: req.body.campaign,
    UserId: req.user.id
  })
  .then(pc => {
    console.log(pc.get({plain:true}))
    return req.user.addCharacter(pc)
    .then((user)=>{
      if(req.requestType('json')) return res.send(pc.get({plain:true}))
      if(req.requestType('modal')) return res.render('modals/_success', {title: "Character Created", body:"Good job", redirect:'/pc/'+pc.id})
      return res.redirect('/pc/'+pc.id);
    })
  }).catch(next);
});

router.get('/create', (req, res, next) => {
  if(!req.user) {
    err = new Error();
    err.message = "You must be logged in"
    err.status = 403
    return next(err);
  }
  var races = require(APPROOT + '/system/races')
  res.render('characters/new', {context:req.query})
});



router.get('/:id',(req,res,next) => {
  db.Character.findOne({
    where: {id:req.params.id},
    include: [
      {model: db.Item},
      {model: db.Lore, as: 'lore'}
    ],
  })
  .then(character => {
    if(!character) return next();

    if(req.requestType('json')) return res.send(character.get({plain:true}))
    if(req.requestType('modal')) return res.render('characters/detail',{character:character.get({plain:true})})
    return res.render('characters/detail',{character:character.get({plain:true})})
  })
  .catch(next)
})

router.post('/:id', (req,res,next) => {
  db.Character.findOne({where: {id:req.params.id}})
  .then(character => {
    if(!req.user.hasCharacter(character)) throw Common.error.authorization("You don't have permission to modify that character");
    return res.redirect('/'+req.params.id)
  })
  .catch(next)

  return next();
})

router.post('/:id/select',(req,res,next) => {
  db.Character.findOne({where: {id:req.params.id}})
  .then(pc => {
    return req.user.setMainChar(pc)
    .then(req.user.save)
    .then(user => {

      if(req.requestType('json')) return res.send(pc.get({plain:true}))
      if(req.requestType('modal')) return res.render('modals/_success',{title: pc.name + " selected"})
      return res.redirect('pc/'+pc.id,{character:pc.get({plain:true})})
    })
  })
  .catch(next)
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
    if(req.requestType('json')) return res.send(character.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success', {title:"Character Deleted", redirect:req.headers.referer || "/pc"})
    return res.redirect('/pc')
  })
  .catch(next)
})

module.exports = router;
