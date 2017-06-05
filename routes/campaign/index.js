'use strict';

var express = require('express');
var router = express.Router();

// Campaign Index
// returns a list of all existing campaigns that have their privacy setting
router.get('/', Common.middleware.requireUser, (req, res, next) => {
  let query = { privacy_level: {$not: 'hidden'} }

  return Promise.try(()=>{
    // if the campaign route is mounted on top of a user, get all campaigns they have permissions for
    if(res.locals.user) return res.locals.user.getPermission()
    // otherwise, find all non-hidden campaigns
    return db.Campaign.findAll({where: {privacy_level: {$not: 'hidden'}}})
  })
  .then(campaigns => {
    return res.render('campaign/index', {campaigns: campaigns})
  })
  .catch(next);
});

router.get('/new', Common.middleware.requireUser, (req, res, next) => {

  // for new campaigns, get the name of all available systems
  if(req.modal) return res.render('campaign/modals/edit',{systems:SYSTEM.names})
  return res.render('campaign/new')
});

router.post('/', Common.middleware.requireUser, (req,res,next) => {

  return req.user.createCampaign(req.body)
  .then((campaign) => {
    return req.user.addPermission(campaign, {owner: true, read:true, write:true})
    .then(permission => {
      return res.redirect(campaign.url)
    })
  })
  .catch(next)

});

var campaignRouter = express.Router({mergeParams: true});

router.post('/:id/request', Common.middleware.requireUser, (req,res,next) => {

  var query = isNaN(req.params.id) ? {url:req.params.id} : {id:req.params.id}
  return db.Campaign.findOne({where: query})
  .then(campaign => {
    //
    return req.user.addPermission(campaign)
    .then()

  })
  .catch(next)

})

router.use('/:id', (req,res,next) => {

  // if the res campaign has already been set, skip the query
  if(res.locals.campaign && res.locals.campaign.permission) return next();
  // if(req.params.id == res.locals.campaign.id || req.params.id == res.locals.campaign.getDataValue('url')) return next();

  // find the campaign by the url or id
  var query = isNaN(req.params.id) ? {url:req.params.id} : {id:req.params.id}
  return db.Campaign.findOne({where: query})
  .then(campaign => {
    // campaign does not appear if it doesn't exist, or if it is hidden and there is no user
    if(!campaign || !req.user && campaign.privacy_level == 'hidden') throw Common.error.notfound('Campaign')
    if(!req.user) return campaign 

    // if there is a user, check their permission
    return req.user.checkPermission(campaign,{read:true})
    .then(permission => {
      if(permission&&permission.owner) campaign.owned = true;
      // if the campaign is hidden to the user, treat it as though it doesn't exist
      if(!permission && campaign.privacy_level == 'hidden') throw Common.error.notfound('Campaign')
      // otherwise return the campaign with attached permission info
      return campaign;
    })
    // hidden campaigns do not route at all, they are totally invisible (privacy!)
  })
  .then(campaign => {
    res.locals.campaign = campaign
    res.locals.breadcrumbs.push({name:campaign.name, url: req.baseUrl})
    return next();
  })
  .catch(next)

}, campaignRouter)

// get campaign info
campaignRouter.get('/', (req,res,next) => {
  res.locals.breadcrumbs.pop()
  if(req.json) return res.send(res.locals.campaign.get({plain:true}))
  if(req.modal) return res.render('campaign/_detail')
  return res.render('campaign/detail')
});

campaignRouter.post('/request', Common.middleware.requireUser, (req,res,next) => {

  return req.user.hasPermission(res.locals.campaign)
  .then(hasPermission => {
    if(hasPermission) throw Common.error.request('You have already requested access to this campaign');

    return req.user.addPermission(res.locals.campaign)
  })
  .then(permission => {
    return res.set('X-Redirect', req.baseUrl).sendStatus(302);
  })
  .catch(next)
})

// all routers beyond this are subject to privacy rules
campaignRouter.use('/', (req,res,next) => {
  // public campaigns are accessible to visitors who aren't logged in
  if(res.locals.campaign.privacy_level == 'public') return next();
  if(!req.user) throw Common.error.authorization("This campaign's privacy settings require you to have an account to view its resources")

  return Promise.try(()=>{
    if(res.locals.campaign.Permission) return res.locals.campaign.Permission
    return req.user.checkPermission(res.locals.campaign, {read: true})
  })
  .then(permission => {
    if(permission) return next();
    if(req.xhr) {
      res.set('X-Modal', true)
      res.set('X-Redirect', req.baseUrl).sendStatus(302)
    }

    if(res.locals.campaign.password) return res.render('campaign/password');
    return res.render('campaign/requestInvite');
  })
  .catch(next)
})


campaignRouter.get('/edit', Common.middleware.requirePermission('campaign', {owner:true}), (req,res,next) => {
  if(req.json) return res.send(res.locals.campaign.get({plain:true}))
  if(req.modal) return res.render('campaign/modals/edit')
  return res.render('campaign/detail')
});

// edit campaign
campaignRouter.post('/', Common.middleware.requireGM, (req,res,next) => {

  return req.user.checkPermission(res.locals.campaign, {owner: true})
  .then(permission => {
    if(!permission) throw Common.error.authorization('You do not have permission to modify this campaign')

    for(var key in req.body) res.locals.campaign[key] = req.body[key]

    return res.locals.campaign.save()
    .then(campaign => {

      if(req.modal) return res.send('modals/_success',{title:'Campaign Updated'})
      if(req.xhr) return res.set('X-Redirect', req.headers.referer).sendStatus(302);
      return res.redirect(req.headers.referer)

    })
  })
  .catch(next);
});

// see all users who have requested access to your campaign
campaignRouter.get('/requests', Common.middleware.requirePermission('campaign', {$or:[{owner:true},{'rights.invite':true}]}), (req,res,next) => {
  return res.locals.campaign.getMember({through: {where: {owner:false, read:false, write:false}}})
  .then(users => {
    return res.json(users)
    // TODO: Render page for all invites that allows campaign managers to set permission levels

  })
  .catch(next)
});

campaignRouter.delete('/', /*Common.middleware.requirePermission('campaign',{write:true}),*/ Common.middleware.confirmDelete('redirect'), (req,res,next) => {

  return res.locals.campaign.destroy()
  .then(campaign => {
    if(req.xhr) return res.set('X-Redirect', '/c/').sendStatus(302)
    return res.render('modals/_success',{title:"Campaign Deleted", redirect:'/c/'})
  })
  .catch(next)

  // return res.send(res.locals.campaign)
  // return res.send('<h1>Just some html</h1>')
});

campaignRouter.use(['/calendar','/e'], require('./calendar'));
campaignRouter.use('/pc', require('../character'));
campaignRouter.use('/quests', require('./quests'));
campaignRouter.use('/factions', require('./factions'));
campaignRouter.use('/lore', require('../lore'));

module.exports = router;
