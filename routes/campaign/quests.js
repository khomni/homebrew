var express = require('express');
var router = express.Router();

router.get('/', (req,res,next) => {
  if(!res.locals.campaign) return next();

  return res.locals.campaign.getQuests({
    where:{hierarchyLevel:1}, // make sure the campaign quests only get populated once per index
    include: [
      {model:db.Quest, as: 'descendents', hierarchy: true, include: {model:db.Comment, as: 'comments', attributes:['id']}},
      {model:db.Comment, as: 'comments', attributes:['id']},
    ],
  })
  .then(quests => {
    res.locals.quests = quests
    return res.render('campaign/quests/index')
  })
  .catch(next)

});

router.post('/', (req,res,next) => {
  if(!res.locals.campaign) return next();

  return res.locals.campaign.createQuest(req.body)
  .then(quest => {
    if(req.requestType('json')) return res.json({redirect:req.headers.referer})
    return res.redirect(req.headers.referer)
  })
  .catch(next);

});

router.get('/new', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to make quests"))
  if(req.requestType('modal')) return res.render('campaign/quests/modals/edit')
})

var questRouter = express.Router({mergeParams: true});

router.use('/:id', (req,res,next) => {
  return db.Quest.findOne({
    where:{id:req.params.id},
      // include: {model: db.Quest}
    include: [
      {model: db.Quest, as: 'descendents', hierarchy:true},
      {model: db.Quest, as: 'ancestors'},
    ],
  })
  .then(quest => {
    if(!quest) throw next(Common.error.notfound('Quest'))
    res.locals.quest = quest
    return next();
  })
  .catch(next)
}, questRouter)

questRouter.get('/', (req,res,next) => {

  res.locals.quest.getComments()
  .then(comments => {
    return res.render('campaign/quests/detail', {comments:comments})
  })
});

questRouter.post('/', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to make quests"))
  for(key in req.body) res.locals.quest[key] = req.body[key]
  return res.locals.quest.save()
  .then(quest => {
    if(req.requestType('json')) return res.json({redirect:req.headers.referer})
    return res.redirect(req.headers.referer)
  })
  .catch(next)

  return res.render('campaign/quests/detail')
});

questRouter.get('/add', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to make quests"))
  if(req.requestType('modal')) return res.render('campaign/quests/modals/edit',{quest:null,parent:res.locals.quest})
})

questRouter.post('/add', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to make quests"))

  return res.locals.quest.createChild(Object.assign(req.body,{CampaignId:res.locals.campaign.id}))
  .then(quest => {
    if(req.requestType('json')) return res.json({redirect:req.headers.referer})
    return res.redirect("/"+res.locals.campaign.url+"quests/"+ quest.id)
  })
  .catch(next)
})

questRouter.delete('/', Common.middleware.requireUser, Common.middleware.confirmDelete, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to delete quests"))

  // delete up the tree
  return res.locals.quest.getDescendents({order:[['hierarchyLevel','DESC']]})
  .then(quests => {
    Promise.each(quests, quest => {
      return quest.destroy().reflect()
    })
    .then(results => {
      return res.locals.quest.destroy()
    })
  })
  // TODO: delete all child quests at once
  // return res.locals.quest.destroy()
  .then(() => {
    if(req.requestType('json')) {
      return res.json({ref:res.locals.quest,kind:"Quest"})
    }
  })
  .catch(next)
  return next();
});

// brings up a dialog that allows details of a quest to be modified
questRouter.get('/edit', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to edit quests"))
  if(req.requestType('modal')) return res.render('campaign/quests/modals/edit');
});

// Quest Linking
// link the routed quest to another quest
// brings up a dialog that lets the user select another quest to link to
questRouter.get('/link', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to link quests"))

  // get the campaign's quests and all of their descendents
  return res.locals.campaign.getQuests({attributes:['name','id'], include: {model:db.Quest, as: 'descendents', hierarchy: true}})
  .then(linkable => {
    if(req.requestType('modal')) return res.render('campaign/quests/modals/link',{linkable:linkable});
    return next();
  })
  .catch(next)
});

// creates a dependent
// req.body is the id of the target quest
questRouter.post('/link', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to link quests"));

  return db.Quest.findOne({where: {id:req.body.quest}})
  .then(quest => {
    if(!quest) throw null // quest does not exist

    return res.locals.campaign.hasQuest(quest)
    .then(owned => {
      if(!owned) throw Common.error.authorization("You can only link quests to quests in the same campaign");
      return quest
    })
  })
  .then(quest => {
    // add the quest as a child to the targeted quest
    if(!req.body.asParent) return quest.addChild(res.locals.quest)
    // otherwise, nest the targeted quest and all its children under the active quest
    return quest.hasDescendent(res.locals.quest)
    .then(descended => {
      // if the quest is a descendent of the targeted quest, unset the parent, removing it from the hierarchy
      if(descended) return res.locals.quest.setParent(null)
      return null
    })
    .then(() => {
      // set the quest as the targeted quest's parent
      return quest.setParent(res.locals.quest) // otherwise
    })
  })
  .then(quest => {
    if(req.requestType('json')) return res.json({redirect:req.baseUrl})
    if(req.requestType('modal')) return res.render('modals/_success',{redirect:req.baseUrl})
  })
  .catch(next)
});

// Comments



questRouter.use('/comment',(req,res,next) => {
  res.locals.commentable = res.locals.quest
  return next();
},require(APPROOT+'/routes/comment'));

questRouter.use('/lore',(req,res,next) => {
  res.locals.lorable = res.locals.quest

  // give user access to add lore and automatically learn existing lore if they own the campaign
  if(res.locals.campaign.owned) {
    res.locals.permission.read = true
    res.locals.permission.write = true
  }

  return next();
},require(APPROOT+'/routes/lore'));

module.exports = router
