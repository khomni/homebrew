var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  if(!req.user) return next();
  var query = {}
  var include = []

  return Promise.method(function(){
    if(res.locals.campaign) return db.Character.findAll({where:{CampaignId:res.locals.campaign.id}})
    return db.Character.findAll({include:[{model:db.Campaign}], order: [['CampaignId'],['name']]})
  })()
  .then(characters => {
    if(req.requestType('json')) return res.json(characters)

    return res.render('characters/', {characters:characters})
  })
  .catch(next)
});

router.post('/', Common.middleware.requireUser, (req,res,next) => {

  return req.user.createCharacter({
    name: req.body.name,
    race: req.body.race,
    sex: req.body.sex,
    CampaignId: req.body.campaign || undefined,
    UserId: req.user.id
  })
  .then(pc => {
    if(!req.body.description) return pc;

    return pc.createLore({content:req.body.description, obscurity:0})
    .then(lore => {
      return pc
    })
  })
  .then(pc => {
    if(req.requestType('json')) return res.send(pc.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success', {title: "Character Created", body:"Good job", redirect:pc.url})
    return res.redirect(pc.url);
  })
  .catch(next);
});

router.get('/create', Common.middleware.requireUser, (req, res, next) => {
  return res.render('characters/new')
});

var characterRouter = express.Router({mergeParams: true});

// character router handles individual subpages that pertain to the individual character
router.use('/:id', (req,res,next) => {
  if(res.locals.character) return next();
  return db.Character.findOne({where: {id: req.params.id}, include:[{model:db.Campaign}]})
  .then(character => {
    if(!character) throw Common.error.notfound('Character')
    if(character.id == req.user.MainCharId) character.active = true
    res.locals.character = character
    res.locals.activeSystem = SYSTEM[character.Campaign.system]
    res.locals.breadcrumbs.add(character.get({plain:true}))
    throw null
  })
  .catch(next)
}, characterRouter)

characterRouter.get('/',(req,res,next) => {

  if(req.requestType('json')) return res.json(res.locals.character.get({plain:true}))
  if(req.requestType('modal')) return res.render('characters/detail')
  return res.render('characters/detail')

})

characterRouter.post('/', Common.middleware.requireCharacter, (req,res,next) => {

  for(key in req.body) res.locals.character[key] = req.body[key]
  return res.locals.character.save()
  .then(character => {
    return res.redirect(req.headers.referer||'/')

  })
  // TODO: character editing interface


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


characterRouter.use('/journal', require('./journal'));
characterRouter.use('/inventory', require('./items'));
characterRouter.use('/relationship', require('./relationships'));

characterRouter.use('/', (req,res,next) => {
  res.locals.lorable = res.locals.character
  return next();
});

characterRouter.use('/lore',require('../lore'));
characterRouter.use('/knowledge', require('./knowledge'));

module.exports = router;
