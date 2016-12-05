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
  return db.Character.findOne({where: {id: req.params.id}})
  .then(character => {
    if(!character) throw Common.error.notfound('Character')
    if(character.id == req.user.MainCharId) character.active = true
    res.locals.character = character
    throw null
  })
  .catch(next)
}, characterRouter)

characterRouter.get('/',(req,res,next) => {

  if(req.requestType('json')) return res.send(character.get({plain:true}))
  if(req.requestType('modal')) return res.render('characters/detail')
  return res.render('characters/detail')

})

characterRouter.post('/', Common.middleware.requireCharacter, (req,res,next) => {

  // TODO: character editing interface

  return res.redirect('/'+req.params.id)
})

characterRouter.delete('/', Common.middleware.requireCharacter, (req,res,next) => {

  return res.locals.character.destroy()
  .then(character => {
    if(req.requestType('json')) return res.send(res.locals.character.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success', {title: res.locals.character.name + " deleted", redirect:req.headers.referer || "/pc"})
    return res.redirect('/pc')
  })
  .catch(next)

});

characterRouter.post('/select', Common.middleware.requireCharacter, (req,res,next) => {

  return req.user.setMainChar(res.locals.character)
  .then(req.user.save)
  .then(user => {
    if(req.requestType('json')) return res.send(res.locals.character.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success',{title: res.locals.character.name + " selected"})
    return res.redirect(req.headers.referer)
  })
  .catch(next)

})

characterRouter.get('/connect', (req,res,next) => {

  return req.user.getMainChar()
  .then(activeChar => {
    return db.Character.relationships([activeChar, res.locals.character])
    .then(relationships => {
      res.locals.activeChar = activeChar

      if(req.requestType('modal')) return res.render('characters/_connect.jade')
    })
  })
  .catch(next)

})

characterRouter.post('/connect', Common.middleware.requireCharacter, (req,res,next) => {

  return req.user.getMainChar()
  .then(activeChar => {
    return activeChar.setRelationship(res.locals.character,{quality:req.body.quality})
  })
  .then(results => {
    return res.send(results)

  })
  .catch(next)
  return next()
})


characterRouter.use('/journal', require('./journal'));
characterRouter.use('/inventory', require('./items'));
characterRouter.use('/relationship', require('./relationships'));

module.exports = router;
