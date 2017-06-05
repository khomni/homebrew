var express = require('express');
var router = express.Router();

// LORE ROUTER
// mount this router onto
// declare `res.locals.lorable` to choose a lorable item to work with

// this will reach the knowledge router and insert the lorable object
router.use('/knowledge',require('../character/knowledge'))

router.get('/', Common.middleware.requireCharacter, (req,res,next) => {
  res.locals.breadcrumbs.push({name: "Lore", url:req.baseUrl});
  if(res.locals.lorable) return next();
  // no lorable item
  return res.redirect('/knowledge');
});

// get all the lore the lore from the lorable object
router.get('/', Common.middleware.requireCharacter, (req, res, next) => {
  if(!res.locals.lorable.getLore) return next(Common.error.request('That resource cannot have lore'))

  // TODO: nifty way of determining if the user has dominion over the lorable

  // get all lore belonging to the lorable
  return res.locals.lorable.getLore()
  .then(lore => {
    // for each piece of lore associated with the lorable, determine if it is known by the activeChar
    return Promise.map(lore, piece => {
      piece.owned = piece.ownedBy(req.user) || res.locals.campaign.owned || req.user.admin
      return req.user.MainChar.hasKnowledge(piece)
      .then(hasKnowledge => {
        if(hasKnowledge) return piece // character knows this lore

        if(piece.obscurity == 0) {
          // piece is not obscure knowledge, character learns it automatically
          return req.user.MainChar.addKnowledge(piece)
          .then(knowledge => {
            return piece
          })
        }
        // user does not know lore
        piece.hidden = true
        return piece
      })
    })
    .then(filtered => {
      if(req.json) return res.json(filtered)
      if(req.xhr) return res.render('lore/_list',{base:req.baseUrl, loreList:filtered})
      if(req.modal) return res.render('lore/modals/list',{base:req.baseUrl, title: res.locals.lorable.name, loreList:filtered})
      return res.json(filtered)
    })
  })
  .catch(next)
});

// lore index when no lorable has been added
// defaults to obtaining the lore the active character knows


router.get('/new', (req,res,next)=>{
  if(!res.locals.permission.write) return next(Common.error.authorization('You are not permitted to add lore to this resource'))
  if(req.modal) return res.render('lore/modals/edit',{base:req.baseUrl})
})

// Add lore to the lorable object
router.post('/', Common.middleware.requireUser, (req, res, next) => {
  if(!res.locals.lorable) return next(Common.error.request('Cannot add lore to nothing'))
  if(!res.locals.lorable.createLore) return next(Common.error.request('That resource cannot have lore'))
  if(!res.locals.permission.write) return next(Common.error.authorization('You are not permitted to add lore to this resource'))

  Object.assign(req.body,{authorId:req.user.id, lorable_id: res.locals.lorable.id})

  // create a bit of lore for the lorable
  return res.locals.lorable.createLore(req.body)
  .then(lore => {
    if(!req.user.MainChar) return lore
    // if there is an active character, add that lore as knowledge automatically
    return req.user.MainChar.addKnowledge(lore).then(()=>{return lore})
  })
  .then(lore => {
    return res.json(lore)
  })
  .catch(next)
});

loreRouter = express.Router({mergeParams: true});

router.use('/:id', Common.middleware.requireCharacter, (req,res,next) => {

  return Promise.resolve().then(()=>{
    if(!res.locals.lorable) {
      return db.Lore.find({where:{id:req.params.id}})
    }

    return res.locals.lorable.getLore({where:{id:req.params.id}})
    .then(lore => {
      lore = lore.pop()
      return lore
    })
  })
  .then(lore => {
    if(!lore) throw Common.error.notfound('Lore')
    lore.owned = lore.ownedBy(req.user) || res.locals.campaign.owned || req.user.admin

    return req.user.MainChar.hasKnowledge(lore)
    .then(hasKnowledge => {
      // if the character doesn't know the lore and it's unobscure, or they completely own the lorable resource, learn it automatically
      if(!hasKnowledge && (lore.obscurity == 0)) return req.user.MainChar.addKnowledge(lore).then(() => {return lore})
      // the hidden status of the lore depends on the MainChar possessing the knowledge
      lore.hidden = !hasKnowledge
      return lore
    })
    .then(lore => {
      res.locals.base = req.baseUrl
      res.locals.lore = lore
      return next()
    })
  })
  .catch(next)

}, loreRouter)

loreRouter.get('/', (req, res, next) => {

  if(res.locals.lore.hidden) return next(Common.error.request(req.user.MainChar.getName('first') + " does not know this"))

  if(req.json) return res.json(res.locals.lore)
  if(req.xhr) return res.render('lore/_lore')

});

loreRouter.get('/edit', Common.middleware.requireUser, (req, res, next) => {

  if(!res.locals.lore.owned) return next(Common.error.request("You can't modify lore you haven't written"))

  if(req.json) return res.json(res.locals.lore)
  if(req.modal) return res.render('lore/modals/edit')

});

loreRouter.post('/', Common.middleware.requireUser, (req, res, next) => {

  if(!res.locals.lore.owned) return next(Common.error.request("You can't modify lore you haven't written"))

  return res.locals.lore.update(req.body)
  .then(lore => {
    if(req.json) return res.json(lore)
    if(req.xhr) return res.render('lore/_lore',{lore:lore})
  })
  .catch(next)
});

loreRouter.delete('/', Common.middleware.requireGM, (req, res, next) => {

  if(!res.locals.lore.ownedBy(req.user) || res.locals.campaign.owned || req.user.admin) return next(Common.error.request("You can't delete lore you haven't written"))

  return res.locals.lore.destroy()
  .then(() => {
    if(req.json) return res.json(res.locals.lore)
    if(req.xhr) return res.render('lore/_lore',{lore:null})
  })
  .catch(next)

});



// learn a piece of lore
loreRouter.post('/learn', Common.middleware.requireCharacter, (req, res, next) => {

  return req.user.MainChar.addKnowledge(res.locals.lore)
  .then(knowledge => {
    res.locals.lore.hidden = false
    if(req.json) return res.json(res.locals.lore)
    if(req.xhr) return res.render('lore/_lore.jade')
  })
  .catch(next)

});

// learn a piece of lore
loreRouter.get('/teach', Common.middleware.requireCharacter, (req, res, next) => {

  return req.user.MainChar.hasKnowledge(res.locals.lore)
  .then(hasKnowledge => {
    if(!hasKnowledge) throw Common.error.request("You can't teach what you don't know.")

    return req.user.MainChar.getMembership({
      include:[{
        model:db.Character,
        as:'members',
        where: {id: {$ne: req.user.MainChar.id}},
        include: [{model:db.Lore, as: 'knowledge'}]
      }]
    })
    .then(factions => {
      if(req.modal) return res.render('lore/modals/teach',{factions:factions})
      return next()
    })
  })
  .catch(next)

});

// teach a piece of lore
loreRouter.post('/teach', Common.middleware.requireCharacter, (req, res, next) => {

  var bulk = Common.utilities.dedupe(req.body.pc).map(id => {
    return {CharacterId: id, LoreId: res.locals.lore.id}
  })

  return db.Knowledge.bulkCreate(bulk)
  .then(knowledge => {
    return res.json(res.locals.lore)
  })
  .catch(next)
});

module.exports = router;
