var express = require('express');
var router = express.Router();

router.get('/', Common.middleware.requireUser, (req, res, next) => {

  let query = {}

  if('n' in req.query) {
    query.limit = Number(req.query.n);
  }

  if('search' in req.query) {
    query.where = {$name: {$like: '%' + req.query.search.toLowerCase() + '%'}}
  }

  return Promise.try(() => {
    if(res.locals.faction) return res.locals.faction.getMembers(query)
    if(res.locals.user) return res.locals.user.getCharacters(query)
    if(res.locals.campaign) return res.locals.campaign.getCharacters(query)
    return db.Character.findAll(Object.assign(query, {include:[{model:db.Campaign}], order: [['CampaignId'],['name']]}))
  })
  .then(characters => {
    if(req.json) return res.json(characters)
    if(req.modal) return res.render('characters/modals/select',{characters});
    if(req.isTab) return res.render('characters/_index', {characters});
    return res.render('characters/', {characters})
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

router.post('/select', Common.middleware.requireUser, (req, res, next) => {

  return req.user.getCharacters({where: isNaN(req.body.id) ? {url:req.body.id} : {id:req.body.id}})
  .then(characters => {
    let character = characters[0];
    if(!character) throw Common.error.authorization("You don't own that character")
    return req.user.setMainChar(character)
    .then(user => {
      if(req.json) return res.send(character.get({plain:true}));
      if(req.modal) return res.render('modals/_success',{title: character.name + " selected"});
      if(req.xhr) return res.set('X-Redirect',req.baseUrl).sendStatus(302);
      return res.redirect(req.headers.referer||req.baseUrl)
    })
  })
  .catch(next)
})

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
      res.locals.activeSystem = character.Campaign.system
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
}, require('./character-router'));

module.exports = router;
