var express = require('express');
var router = express.Router();

router.use((req,res,next) => {
  if(!res.locals.campaign) return next(Common.error.request('Campaign is required'))
  return next()
})

/* GET faction listing. */
router.get('/', Common.middleware.requireUser, (req, res, next) => {

  console.log(db.methods(res.locals.character,/membership|faction/gi))

  // get the factions, their member and their leader
  var query = {include:[{model:db.Character, as: 'members'},{model:db.Character, as: 'leader'}]}

  return Promise.resolve().then(() => {
    if(res.locals.character) return res.locals.character.getMembership(query)
    if(res.locals.campaign) return res.locals.campaign.getFactions(query)
    return db.Faction.findAll(query)
  })
  .then(factions => {
    if(req.requestType('json')) return res.json(factions)
    if(req.requestType('modal')) return res.render('campaign/factions/modals/index',{factions:factions})
    return res.render('campaign/factions/index',{factions:factions})
  })
  .catch(next)
});

router.get('/new', Common.middleware.requireUser, Common.middleware.objectifyBody, (req, res, next) => {

  if(req.requestType('modal')) return res.render('campaign/factions/modals/edit')
  return res.render('campaign/factions/new')
});

router.post('/', Common.middleware.requireCharacter, Common.middleware.objectifyBody, (req, res, next) => {

  return res.locals.campaign.createFaction(req.body)
  .then(faction => {
    return Promise.all([
      faction.setLeader(req.user.activeChar),
      faction.addMember(req.user.activeChar),
    ])
  })
  .then(()=>{
    return res.redirect(req.headers.referer||req.baseUrl)
  })
  .catch(next)
});

var factionRouter = express.Router({mergeParams: true});

router.use('/:id', Common.middleware.requireUser, (req, res, next) => {

  return db.Faction.findOne({where:{id: req.params.id}, include:[{model:db.Character, as:"leader"},{model:db.Character, as:"members"}]})
  .then(faction => {
    if(!faction) throw Common.error.notfound('Faction')
    res.locals.faction = faction
    return next()
  })
  .catch(next)
}, factionRouter);

// get information about faction
factionRouter.get('/', (req,res,next) => {
  if(req.requestType('json')) return res.json(res.locals.faction)
  if(req.requestType('modal')) return res.render('campaign/factions/modals/detail')
  return next()
});

factionRouter.get('/edit', (req,res,next) => {
  if(req.requestType('modal')) return res.render('campaign/factions/modals/edit')
  return res.render('campaign/factions/edit')
});

factionRouter.post('/', (req,res,next) => {
  return res.locals.faction.update(req.body)
  .then(faction => {
    return res.redirect(req.headers.referer||req.baseUrl)
  })
  .catch(next)
});

factionRouter.post('/join', Common.middleware.requireUser, (req,res,next) => {

  return req.user.activeChar.hasMembership(res.locals.faction)
  .then(isMember => {
    // active character is not yet a member, add membership
    if(!isMember) return req.user.activeChar.addMembership(res.locals.faction)

    // active character is already a member, remove membership
    if(isMember) return req.user.activeChar.removeMembership(res.locals.faction)
    .then(()=>{
      return res.locals.faction.getMembers() // update remaining members
    })
    .then(members => {
      var isLeader = res.locals.faction.leader.id == req.user.activeChar.id
      if(!isLeader) return; // the member that left is not the leader

      // the faction leader just left. If there are no more members, disband the faction
      if(members.length == 0) return res.locals.faction.destroy()
      // there are other members, select the first member as the new leader
      return res.locals.faction.setLeader(members[0])
    })
  })
  .then(membership => {
    return res.redirect(req.headers.referer||req.baseUrl)
  })
  .catch(next)
});

module.exports = router;