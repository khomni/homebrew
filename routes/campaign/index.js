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
    return res.redirect('/c/'+campaign.url)
  })
  .catch(next)

});

router.get('/:id',(req,res,next) => {
  //
  var query = isNaN(req.params.id) ? {url:req.params.id} : {id:req.params.id}
  db.Campaign.findOne({
    where: query,
    include: [
      {model: db.User.scope('public'), as: 'Owner'},
    ],
  })
  .then(campaign => {
    if(!campaign) return next();
    // campaign.Owner.id == req.user.id
    console.log(campaign.get({plain:true}))

    if(req.requestType('json')) return res.send(campaign.get({plain:true}))
    if(req.requestType('modal')) return res.render('campaign/_detail',{campaign:campaign.get({plain:true})})
    return res.render('campaign/detail',{campaign:campaign.get({plain:true})})
  })
  .catch(next)
});

router.post('/:id', Common.middleware.requireUser, (req,res,next) => {
  db.Campaign.findOne({where: {id:req.params.id}})
  .then(campaign => {
    if(!req.user.hasCharacter(character)) throw Common.error.authorization("You don't have permission to modify that character");
    return res.redirect('/'+req.params.id)
  })
  .catch(next)

  return next();
})

router.delete('/:id',Common.middleware.requireUser, (req,res,next) => {

  db.Campaign.findOne({where: {id:req.params.id}})
  .then(campaign => {
    if(!req.user.controls(campaign)) throw Common.error.authorization('You do not have permission to delete this campaign')
    return campaign.destroy()
  })
  .then(() => {

    if(req.requestType('json')) return res.send(character.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success', {title:"Character Deleted", redirect:req.headers.referer || "/pc"})
    return res.redirect('/pc')
  })
  .catch(next)
})

router.post('/:id/delete',(req,res,next) => {
  if(!req.user) {
    var err = new Error();
    err.status = 403;
    err.message = "You must be logged in to delete characters"
  }
  db.Character.findOne({where: {id:req.params.id}})
  .then(character => {
    if(!character) {
      var err = new Error();
      err.status = 404;
      err.message = "Character does not exist"
      return err
    }
    if(req.user.hasCharacter(character)) {
      return character.destroy();
    }
    else {
      var err = new Error();
      err.status = 403;
      err.message = "You are not authorized to delete this character"
      return err
    }
  }).then(() => {
    if(req.requestType('json')) return res.send(character.get({plain:true}))
    if(req.requestType('modal')) return res.render('modals/_success', {title:"Character Deleted", redirect:req.headers.referer || "/pc"})
    return res.redirect('/pc')
  })
  .catch(next)
})

module.exports = router;
