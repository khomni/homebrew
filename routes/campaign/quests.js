var express = require('express');
var router = express.Router();

router.get('/', (req,res,next) => {
  if(!res.locals.campaign) return next();

  return res.locals.campaign.getQuests({ include: {model:db.Quest, as: 'descendents', hierarchy: true}
    // include: [{model: db.Quest, as: 'quests', through:{where: {subquest:true}}, include: [{model: db.Quest, as: 'quests', through:{where: {subquest:true}}}]}]
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
      {model: db.Quest, as: 'ancestors'}
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

  return res.locals.quest.createChild(req.body)
  .then(quest => {
    if(req.requestType('json')) return res.json({redirect:req.headers.referer})
    return res.redirect("/"+res.locals.campaign.url+"quests/"+ quest.id)
  })
  .catch(next)
})

questRouter.delete('/', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.campaign.owned) return next(Common.error.authorization("You must be the GM to delete quests"))
  return res.locals.quest.destroy()
  .then(quest => {
    if(req.requestType('json')) {
      return res.json({redirect:"/"+res.locals.campaign.url+"quests"})
    }

  })
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
  db.Quest.findOne({where: {id:req.body.quest}})
  .then(quest => {
    if(!quest) throw null // quest does not exist

    if(!quest.CampaignId) {
      return quest.getAncestors()
      .then(ancestors => {
        return res.locals.campaign.hasQuest(ancestors[0])
        .then(owned => {
          if(!owned) throw Common.error.authorization("You can only link quests to quests in the same campaign");
          return quest
        })
      })
    }
    return res.locals.campaign.hasQuest(quest)
    .then(owned => {
      if(!owned) throw Common.error.authorization("You can only link quests to quests in the same campaign");
      return quest
    })
  })
  .then(quest => {
    console.log('getting ready to link')
    if(!req.body.asParent) return quest.addChild(res.locals.quest)
    return quest.setParent(res.locals.quest)
  })
  .then(quest => {
    if(req.requestType('json')) return res.json({redirect:req.baseUrl})
    if(req.requestType('modal')) return res.render('modals/_success',{redirect:req.baseUrl})
  })
  .catch(next)

  //   return quest.hasQuest(res.locals.quest) // is the target link already associated with the quest?
  //   .then(linked =>{
  //     if(linked) { // if linked, remove link
  //       return quest.removeQuest(res.locals.quest)
  //       .then(() => {
  //         return res.locals.quest.removeQuest(quest)
  //       })
  //     }
  //
  //     // if not linked, create a two way link
  //     return quest.addQuest(res.locals.quest, {subquest:!req.body.subquest}) // the target quest is the parent unless specified
  //     .then(()=>{
  //       res.locals.quest.addQuest(quest,{subquest:!!req.body.subquest})
  //     })
  //   })
  //   .then(quest => {
  //     if(req.requestType('json')) return res.json({redirect:req.baseUrl})
  //     if(req.requestType('modal')) return res.render('modals/_success',{redirect:req.baseUrl})
  //     return res.json()
  //
  //   })
  // })
  // .catch(next)

});

module.exports = router;
