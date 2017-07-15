'use strict';

var express = require('express');
var router = express.Router({mergeParams: true});

router.get('/',(req,res,next) => {

  if(req.json) return res.json(res.locals.character.get({plain:true}))
  if(req.modal) return res.render('characters/detail')
  return res.render('characters/detail')

});

router.post('/', Common.middleware.requireUser, Common.middleware.objectifyBody, (req,res,next) => {
  // TODO: change the fields that can be modified based on the permission type
  if(!req.user.controls(res.locals.character).permission) return next(Common.error.authorization("You aren't authorized to modify that character"))

  return Promise.try(() => {
    if(!res.locals.campaign) return true
    return req.user.checkPermission(res.locals.campaign, {write: true})
  })
  .then(permission => {
    if(!permission) throw new err

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

router.delete('/', Common.middleware.requireUser, (req,res,next) => {

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

router.post('/select', Common.middleware.requireUser, (req,res,next) => {
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

router.get('/edit', Common.middleware.requireUser, (req,res,next) => {
  if(!req.user.controls(res.locals.character).permission) return next(Common.error.authorization("You aren't authorized to modify that character"))

  res.locals.gm = !req.user.controls(res.locals.character).owner

  return res.render('characters/modals/edit')

})


router.use('/journal', require('./journal'));
router.use('/inventory', require('./items'));
router.use('/relationship', require('./relationships'));
router.use('/factions', require('../campaign/factions'));

router.use('/lore', (req,res,next) => {
  res.locals.lorable = res.locals.character

  return req.user.checkPermission(res.locals.campaign, {write: true})
  .then(permission => {

  })
  // give user access to add lore and automatically learn existing lore if they own the character or the campaign
  if(res.locals.character.isActiveChar(req.user) || res.locals.campaign.owned) {
    res.locals.permission.read = true
    res.locals.permission.write = true
  }
  return next();
}, require('../lore'));

router.use('/images', (req,res,next) => {
  res.locals.imageable = res.locals.character
  return next();
}, require('../images'));

router.use('/knowledge', require('./knowledge'));

module.exports = router;
