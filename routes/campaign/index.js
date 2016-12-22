var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', Common.middleware.requireUser, (req, res, next) => {
  var quer = {}
  if(res.locals.user) query = {where:{UserId:res.locals.user.id}}
  db.Campaign.findAll()
  .then(campaigns => {
    return res.render('campaign/index', {campaigns: campaigns})
  })
  .catch(next);
});

router.get('/new', Common.middleware.requireUser, (req, res, next) => {

  // for new campaigns, get the name of all available systems
  if(req.requestType('modal')) return res.render('campaign/modals/edit',{systems:SYSTEM.names})
  return res.render('campaign/new')
});

router.post('/',Common.middleware.requireUser, (req,res,next) => {

  return req.user.createCampaign(req.body)
  .then((campaign) => {
    return res.redirect(campaign.url)
  })
  .catch(next)

});

var campaignRouter = express.Router({mergeParams: true});

router.use('/:id', (req,res,next) => {

  if(res.locals.campaign) return next();
  var query = isNaN(req.params.id) ? {url:req.params.id} : {id:req.params.id}
  return db.Campaign.findOne({where: query})
  .then(campaign => {
    res.locals.campaign = campaign
    res.locals.breadcrumbs.add(campaign.get({plain:true}))
    if(!req.user) return next()
    if(req.user && req.user.id == campaign.UserId) campaign.owned = true
    return next()
  })
  .catch(next)

}, campaignRouter)

// get campaign info
campaignRouter.get('/',(req,res,next) => {
  if(req.requestType('json')) return res.send(res.locals.campaign.get({plain:true}))
  if(req.requestType('modal')) return res.render('campaign/_detail')
  return res.render('campaign/detail')
});

campaignRouter.get('/edit',(req,res,next) => {
  if(req.requestType('json')) return res.send(res.locals.campaign.get({plain:true}))
  if(req.requestType('modal')) return res.render('campaign/modals/edit')
  return res.render('campaign/detail')
});

// edit campaign
campaignRouter.post('/', Common.middleware.requireGM, (req,res,next) => {

  for(key in req.body) res.locals.campaign[key] = req.body[key]

  return res.locals.campaign.save()
  .then(campaign => {

    if(req.requestType('modal')) return res.send('modals/_success',{title:'Campaign Updated'})
    return res.redirect(req.headers.referer)
  })

});

campaignRouter.delete('/', Common.middleware.requireUser, Common.middleware.confirmDelete, (req,res,next) =>{
  return req.user.hasCampaign(res.locals.campaign)
  .then(owned => {
    if(!owned) throw Common.error.authorization("You do not own that campaign")
    return res.render('modals/_success',{title:"Campaign Deleted", redirect:'/c/'})
  })
  // return res.send(res.locals.campaign)
  // return res.send('<h1>Just some html</h1>')
});

campaignRouter.use('/pc', require('../character'));
campaignRouter.use('/quests', require('./quests'));

module.exports = router;
