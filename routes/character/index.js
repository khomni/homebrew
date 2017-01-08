var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', (req, res, next) => {
  if(!req.user) return next();
  var query = {}
  var include = []

  return Promise.method(function(){
    if(res.locals.user) return res.locals.user.getCharacters()
    if(res.locals.campaign) return db.Character.findAll({where:{CampaignId:res.locals.campaign.id}})
    return db.Character.findAll({include:[{model:db.Campaign}], order: [['CampaignId'],['name']]})
  })()
  .then(characters => {
    if(req.requestType('json')) return res.json(characters)
    if(req.requestType('modal')) return res.render('characters/modals/select',{characters:characters})
    return res.render('characters/', {characters:characters})
  })
  .catch(next)
});

router.post('/', Common.middleware.requireUser, Common.middleware.objectifyBody, (req,res,next) => {

  return req.user.createCharacter(req.body)
  .then(pc => {

    return Promise.props({
      campaign: res.locals.campaign ? pc.setCampaign(res.locals.campaign) : Promise.resolve(null),
      // sets the character's public lore from their description
      lore: req.body.description ? pc.createLore({content:req.body.description, obscurity:0}) : Promise.resolve(null),
    })
    .then(results =>{
      return pc
    })
  })
  .then(pc => {
    if(req.requestType('json')) return res.send(pc.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success', {title: "Character Created", body:"Good job", redirect:pc.url})
    return res.redirect(req.baseUrl);
  })
  .catch(next);
});

router.get('/create', Common.middleware.requireUser, (req, res, next) => {

  if(req.requestType('modal')) return res.render('characters/modals/edit')
  return res.render('characters/new');
});

var characterRouter = express.Router({mergeParams: true});

// character router handles individual subpages that pertain to the individual character
router.use('/:id', (req,res,next) => {
  if(res.locals.character) return next();
  return db.Character.findOne({where: {id: req.params.id}, include:[{model:db.Campaign}]})
  .then(character => {
    if(!character) throw Common.error.notfound('Character')
    if(req.user && character.id == req.user.MainCharId) character.active = true
    if(req.user && character.UserId == req.user.id) character.owned = true
    res.locals.character = character
    if(character.Campaign) res.locals.activeSystem = SYSTEM[character.Campaign.system]
    res.locals.breadcrumbs.add(character.get({plain:true}))
    throw null
  })
  .catch(next)
}, characterRouter)

characterRouter.get('/',(req,res,next) => {

  if(req.requestType('json')) return res.json(res.locals.character.get({plain:true}))
  if(req.requestType('modal')) return res.render('characters/detail')
  return res.render('characters/detail')

});

characterRouter.post('/', Common.middleware.requireUser, Common.middleware.objectifyBody, (req,res,next) => {
  // TODO: change the fields that can be modified based on the permission type
  return req.user.controls(res.locals.character)
  .spread((controls, controlType) => {
    if(!controls) throw Common.error.authorization("You aren't authorized to modify that character")

    return res.locals.character.update(req.body)
    .then(character => {
      if(req.requestType('json')) return res.json(character)
      if(req.requestType('modal')) return res.render('modals/_success',{title: res.locals.character.name + " selected"})
      return res.redirect(req.headers.referer)
    })
  })
  .catch(next)
});

characterRouter.delete('/', Common.middleware.requireUser, (req,res,next) => {

  return req.user.hasCharacter(res.locals.character)
  .then(owned => {
    if(!owned) throw Common.error.authorization("You don't own that character")
    return res.locals.character.destroy()
    .then(character => {
      if(req.requestType('json')) return res.send({ref:character,kind:'Character'})
      if(req.requestType('modal')) return res.render('modals/_success', {title: res.locals.character.name + " deleted", redirect:req.headers.referer || "/pc"})
      return res.redirect('/pc')
    })
  })
  .catch(next)

});

characterRouter.post('/select', Common.middleware.requireUser, (req,res,next) => {
  return req.user.hasCharacter(res.locals.character)
  .then(owned => {
    if(!owned) throw Common.error.authorization("You don't own that character")
    return req.user.setMainChar(res.locals.character)
    .then(user => {
      if(req.requestType('json')) return res.send(res.locals.character.get({plain:true}))
      if(req.requestType('modal')) return res.render('modals/_success',{title: res.locals.character.name + " selected"})
      return res.redirect(req.headers.referer||req.baseUrl)
    })
  })
  .catch(next)
})

characterRouter.get('/edit', Common.middleware.requireUser, (req,res,next) => {
  return req.user.controls(res.locals.character)
  .spread((controls, controlType)=> {
    if(!controls) throw Common.error.authorization("You aren't authorized to modify that character")
    // GM edit
    if(controlType.dominion) {
      if(req.requestType('modal')) return res.render('characters/modals/edit',{gm:true})
    }

    if(req.requestType('modal')) return res.render('characters/modals/edit')
    return next()
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
