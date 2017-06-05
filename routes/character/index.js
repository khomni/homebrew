var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', Common.middleware.requireUser, (req, res, next) => {

  return Promise.resolve().then(()=>{
    if(res.locals.faction) return res.locals.faction.getMembers()
    if(res.locals.user) return res.locals.user.getCharacters()
    if(res.locals.campaign) return res.locals.campaign.getCharacters()
    return db.Character.findAll({include:[{model:db.Campaign}], order: [['CampaignId'],['name']]})
  })
  .then(characters => {
    if(req.json) return res.json(characters)
    if(req.modal) return res.render('characters/modals/select',{characters:characters})
    return res.render('characters/', {characters:characters})
  })
  .catch(next)
});

router.post('/', Common.middleware.requirePermission('campaign', {write:true}), Common.middleware.objectifyBody, (req,res,next) => {

  return req.user.createCharacter(req.body)
  .then(pc => {

    return Promise.props({
      permission: pc.addPermission(req.user, {owner: true, read:true, write:true}),
      campaign: res.locals.campaign ? pc.setCampaign(res.locals.campaign) : Promise.resolve(),
      // sets the character's public lore from their description
      lore: req.body.description ? pc.createLore({content:req.body.description, obscurity:0}) : Promise.resolve(),
    })
    .then( results => pc )
  })
  .then(pc => {

    if(req.json) return res.send(pc.get({plain:true}))
    if(req.modal) return res.render('modals/_success', {title: "Character Created", body:"Good job", redirect:pc.url})
    if(req.xhr) return res.set('X-Redirect', character.url).sendStatus(302);
    return res.redirect(character.url);
  })
  .catch(next);
});

router.get('/create', Common.middleware.requireUser, (req, res, next) => {

  if(req.modal) return res.render('characters/modals/edit')
  return res.render('characters/new');
});

var characterRouter = express.Router({mergeParams: true});

// character router handles individual subpages that pertain to the individual character
router.use('/:id', (req,res,next) => {
  if(res.locals.character) return next();

  let query = {where: isNaN(req.params.id) ? {url:req.params.id} : {id:req.params.id}}
  if(!res.locals.campaign) query.include = [{ model: db.Campaign, attributes: ['id','url','system','name'] }]

  return db.Character.findOne({where: isNaN(req.params.id) ? {url:req.params.id} : {id:req.params.id}})
  .then(character => {
    if(!character) throw Common.error.notfound('Character')
    character.active = (req.user && req.user.MainChar && character.id == req.user.MainChar.id)
    character.owned = (req.user && character.ownerId == req.user.id)
    res.locals.character = character
    if(character.Campaign) {
      if(req.user.id == character.Campaign.ownerId) character.Campaign.owned = true
      res.locals.campaign = character.Campaign
      res.locals.activeSystem = SYSTEM[character.Campaign.system]
    }
    res.locals.breadcrumbs.push({name: character.name, url: req.baseUrl})
    return next()
    // return character.getImages()
    // .then(images =>{
    //   res.locals.character.images = images
    //   return next()
    // })
  })
  .catch(next)
}, characterRouter)

characterRouter.get('/',(req,res,next) => {

  if(req.json) return res.json(res.locals.character.get({plain:true}))
  if(req.modal) return res.render('characters/detail')
  return res.render('characters/detail')

});

characterRouter.post('/', Common.middleware.requireUser, Common.middleware.objectifyBody, (req,res,next) => {
  // TODO: change the fields that can be modified based on the permission type
  if(!req.user.controls(res.locals.character).permission) return next(Common.error.authorization("You aren't authorized to modify that character"))

  return Promise.try(() => {
    if(!res.locals.campaign) return true
    return req.user.checkPermission(res.locals.campaign, {write: true})
  })
  .then(permission => {
    return res.locals.character.update(req.body)
    .then(character => {

      if(req.json) return res.json(character)
      if(req.modal) return res.render('modals/_success',{title: res.locals.character.name + " selected"})
      if(req.xhr) return res.set('X-Redirect', character.url).sendStatus(302)
      return res.redirect(character.url)
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
      if(req.json) return res.send({ref:character,kind:'Character'});
      if(req.modal) return res.render('modals/_success', {title: res.locals.character.name + " deleted", redirect:req.headers.referer || "/pc"});
      if(req.xhr) return res.set('X-Redirect', req.user.url).sendStatus(302);
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
      if(req.json) return res.send(res.locals.character.get({plain:true}));
      if(req.modal) return res.render('modals/_success',{title: res.locals.character.name + " selected"});
      if(req.xhr) return res.set('X-Redirect',req.baseUrl).sendStatus(302);
      return res.redirect(req.headers.referer||req.baseUrl)
    })
  })
  .catch(next)
})

characterRouter.get('/edit', Common.middleware.requireUser, (req,res,next) => {
  if(!req.user.controls(res.locals.character).permission) return next(Common.error.authorization("You aren't authorized to modify that character"))

  res.locals.gm = !req.user.controls(res.locals.character).owner

  return res.render('characters/modals/edit')

})


characterRouter.use('/journal', require('./journal'));
characterRouter.use('/inventory', require('./items'));
characterRouter.use('/relationship', require('./relationships'));
characterRouter.use('/factions', require('../campaign/factions'));

characterRouter.use('/lore', (req,res,next) => {
  res.locals.lorable = res.locals.character

  // give user access to add lore and automatically learn existing lore if they own the character or the campaign
  if(res.locals.character.isActiveChar(req.user) || res.locals.campaign.owned) {
    res.locals.permission.read = true
    res.locals.permission.write = true
  }
  return next();
}, require('../lore'));

characterRouter.use('/images', (req,res,next) => {
  res.locals.imageable = res.locals.character
  return next();
}, require('../images'));

characterRouter.use('/knowledge', require('./knowledge'));

module.exports = router;
