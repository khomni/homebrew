var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', Common.middleware.requireUser, (req, res, next) => {
  db.Campaign.findAll({
    include: [
      {model: db.User, as: 'Owner'},
    ],
  })
  .then( campaigns => {
    return res.render('campaign/index', {campaigns: campaigns})
  })
  .catch(next);
});

router.get('/new', Common.middleware.requireUser, (req, res, next) => {
  if(req.requestType('modal')) return res.render('campaign/_new')
  return res.render('campaign/new')
});

router.post('/',Common.middleware.requireUser, (req,res,next) => {

  var campaign = db.Campaign.build(req.body)

  campaign.setOwner(req.user)
  campaign.save()
  .then((campaign) => {
    return res.redirect(campaign.url)
  })
  .catch(next)

});

var campaignRouter = express.Router({mergeParams: true});

router.use('/:id', (req,res,next) => {

  if(res.locals.campaign) return next();
  var query = isNaN(req.params.id) ? {url:req.params.id} : {id:req.params.id}
  return db.Campaign.findOne({
    where: query,
    include: [{model: db.User.scope('public'), as: 'Owner'}]
  })
  .then(campaign => {
    res.locals.campaign = campaign
    res.locals.breadcrumbs.add(campaign.get({plain:true}))
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

// edit campaign
campaignRouter.post('/', Common.middleware.requireGM, (req,res,next) => {

  for(key in req.body) res.locals.campaign[key] = req.body[key]

  return res.locals.campaign.save()
  .then(campaign => {

    if(req.requestType('modal')) return res.send('modals/_success',{title:'Campaign Updated'})
    return res.redirect(req.headers.referer)
  })

});

campaignRouter.delete('/', Common.middleware.requireGM, (req,res,next) =>{
  return res.redirect(req.headers.referer)
});

campaignRouter.use('/pc', require('../character'));
campaignRouter.use('/quests', require('./quests'));

module.exports = router;
