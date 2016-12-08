var express = require('express');
var router = express.Router();

router.get('/', (req,res,next) => {
  if(!res.locals.campaign) return next();

  return res.locals.campaign.getQuests({include: [{ all: true, nested: true}]})
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
    return res.redirect('quests/'+quest.id)
  })
  .catch(next);

});

router.get('/new', Common.middleware.requireGM, (req,res,next) => {
  if(req.requestType('modal')) return res.render('campaign/quests/modals/edit')
})

var questRouter = express.Router({mergeParams: true});

router.use('/:id', Common.middleware.requireGM, (req,res,next) => {
  return db.Quest.findOne({where:{id:req.params.id}, include:[{all:true, nested:true}]})
  .then(quest => {
    if(!quest) throw next(Common.error.notfound('Quest'))
    res.locals.quest = quest
    return next();
  })
  .catch(next)
}, questRouter)

questRouter.get('/', (req,res,next) => {

  console.log(res.locals.quest.subQuests)

  return res.render('campaign/quests/detail')
});

questRouter.post('/', (req,res,next) => {

  for(key in req.body) res.locals.quest[key] = req.body[key]

  return res.locals.quest.save()
  .then(quest => {
    return res.redirect(req.headers.referer)
  })
  .catch(next)

  return res.render('campaign/quests/detail')
});

questRouter.get('/add', Common.middleware.requireGM, (req,res,next) => {
  if(req.requestType('modal')) return res.render('campaign/quests/modals/edit',{quest:null,parent:res.locals.quest})
})

questRouter.post('/add', Common.middleware.requireGM, (req,res,next) => {
  return res.locals.quest.createSubQuest(req.body)
  .then(quest => {
    return res.redirect(res.locals.campaign.url+'/quests/'+quest.id)
  })
  .catch(next)
})

questRouter.delete('/', (req,res,next) => {

  return res.locals.quest.destroy()
  .then(quest => {
    return res.redirect(req.headers.referer)
  })
  return next();
});

questRouter.get('/edit', (req,res,next) => {
  if(req.requestType('modal')) return res.render('campaign/quests/modals/edit');
})

module.exports = router;
