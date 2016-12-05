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

  var character = db.Character.create({
    npc: false,
    name: req.body.name,
    race: req.body.race,
    sex: req.body.sex,
    CampaignId: req.body.campaign,
    UserId: req.user.id
  })
  .then(pc => {
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

var characterRouter = express.Router({mergeParams: true});

// character router handles individual subpages that pertain to the individual character
router.use('/:id', (req,res,next) => {
  return db.Character.findOne({
    where: {id: req.params.id},
  })
  .then(character => {
    req.character = character
    throw null
  })
  .catch(next)
}, characterRouter)

characterRouter.get('/',(req,res,next) => {
  db.Character.findOne({
    where: {id:req.params.id},
    include: [
      {model: db.Item},
      {model: db.Lore, as: 'lore'}
    ],
  })
  .then(character => {
    if(!character) throw null

    if(req.requestType('json')) return res.send(character.get({plain:true}))
    if(req.requestType('modal')) return res.render('characters/detail',{character:character.get({plain:true})})
    return res.render('characters/detail',{character:character.get({plain:true})})
  })
  .catch(next)
})

characterRouter.post('/', Common.middleware.requireUser, (req,res,next) => {
  db.Character.findOne({where: {id:req.params.id}})
  .then(character => {
    if(!character) throw null
    if(!req.user.hasCharacter(character)) throw Common.error.authorization("You don't have permission to modify that character");
    return res.redirect('/'+req.params.id)
  })
  .catch(next)

  return next();
})

characterRouter.post('/select', Common.middleware.requireCharacter, (req,res,next) => {

  return req.user.setMainChar(req.character)
  .then(req.user.save)
  .then(user => {
    if(req.requestType('json')) return res.send(req.character.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success',{title: req.character.name + " selected"})
    return res.redirect(req.headers.referer)
  })
  .catch(next)

  // db.Character.findOne({where: {id:req.params.id}})
  // .then(pc => {
  //   return req.user.setMainChar(pc)
  //   .then(req.user.save)
  //   .then(user => {
  //
  //     if(req.requestType('json')) return res.send(pc.get({plain:true}))
  //     if(req.requestType('modal')) return res.render('modals/_success',{title: pc.name + " selected"})
  //     return res.redirect('pc/'+pc.id,{character:pc.get({plain:true})})
  //   })
  // })
  // .catch(next)
})

characterRouter.delete('/', Common.middleware.requireCharacter, (req,res,next) => {

  return req.character.destroy()
  .then(character => {
    if(req.requestType('json')) return res.send(req.character.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success', {title:"Character Deleted", redirect:req.headers.referer || "/pc"})
    return res.redirect('/pc')
  })
  .catch(next)

  // db.Character.findOne({where: {id:req.params.id}})
  // .then(character => {
  //   throw null;
  //   if(!req.user.hasCharacter(character)) throw Common.error.authorization('You are not authorized to delete this character')
  //   return character.destroy();
  // }).then(character => {
  //   if(req.requestType('json')) return res.send(character.get({plain:true}))
  //   if(req.requestType('modal')) return res.render('modals/_success', {title:"Character Deleted", redirect:req.headers.referer || "/pc"})
  //   return res.redirect('/pc')
  // })
  // .catch(next)
});

characterRouter.use('/journal', require('./journal'));
characterRouter.use('/items', require('./items'));

module.exports = router;
