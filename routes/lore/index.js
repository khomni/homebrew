var express = require('express');
var router = express.Router();

// LORE ROUTER
// mount this router onto
// declare `res.locals.lorable` to choose a lorable item to work with

// this will reach the knowledge router and insert the lorable object
router.use('/knowledge',require('../character/knowledge'))

router.get('/', Common.middleware.requireCharacter, (req,res,next) => {
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
      return req.user.activeChar.hasKnowledge(piece)
      .then(hasKnowledge => {
        if(hasKnowledge) return piece // character knows this lore

        if(piece.obscurity == 0) {
          // piece is not obscure knowledge, character learns it automatically
          return req.user.activeChar.addKnowledge(piece)
          .then(knowledge => {
            return piece
          })
        }
        // user does not know lore and it is obscure
        piece.hidden = true
        return piece
      })
    })
    .then(filtered => {
      if(req.requestType('json')) return res.json(filtered)
      if(req.requestType('xhr')) return res.render('lore/_list',{base:req.baseUrl, loreList:filtered})
      if(req.requestType('modal')) return res.render('lore/modals/list',{base:req.baseUrl, title: res.locals.lorable.name, loreList:filtered})
      return res.json(filtered)
    })
  })
  .catch(next)
});

// lore index when no lorable has been added
// defaults to obtaining the lore the active character knows


router.get('/new', Common.middleware.requireGM, (req,res,next)=>{
  if(req.requestType('modal')) return res.render('lore/modals/edit',{base:req.baseUrl})
})

// Add lore to the lorable object
router.post('/', (req, res, next) => {
  if(!res.locals.lorable) return next(Common.error.request('Cannot add lore to nothing'))
  if(!res.locals.lorable.createLore) return next(Common.error.request('That resource cannot have lore'))

  // create a bit of lore for the lorable
  return res.locals.lorable.createLore(req.body)
  .then(lore => {
    return res.json(lore)
  })
  .catch(next)
});

loreRouter = express.Router({mergeParams: true});

router.use('/:id', Common.middleware.requireCharacter, (req,res,next) => {
  return db.Lore.findOne({where:{id:req.params.id}})
  .then(lore => {
    if(!lore) throw Common.error.notfound('Lore')

    return req.user.activeChar.hasKnowledge(lore)
    .then(hasKnowledge => {
      if(!hasKnowledge && lore.obscurity == 0) return req.user.activeChar.addKnowledge(lore)
      lore.hidden = !hasKnowledge
      lore.owned = res.locals.campaign.owned
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

  if(res.locals.lore.hidden) return next(Common.error.request(req.user.activeChar.getName('first') + " does not know this"))

  if(req.requestType('json')) return res.json(res.locals.lore)
  if(req.requestType('xhr')) return res.render('lore/_lore')

});

loreRouter.get('/edit', Common.middleware.requireGM, (req, res, next) => {

  if(req.requestType('json')) return res.json(res.locals.lore)
  if(req.requestType('modal')) return res.render('lore/modals/edit')

});

loreRouter.post('/', Common.middleware.requireGM, (req, res, next) => {
  return res.locals.lore.update(req.body)
  .then(lore => {
    if(req.requestType('json')) return res.json(lore)
    if(req.requestType('xhr')) return res.render('lore/_lore',{lore:lore})
  })
  .catch(next)
});

loreRouter.delete('/', Common.middleware.requireGM, (req, res, next) => {

  return res.locals.lore.destroy()
  .then(() => {
    if(req.requestType('json')) return res.json(res.locals.lore)
    if(req.requestType('xhr')) return res.render('lore/_lore',{lore:null})
  })
  .catch(next)

});



// learn a piece of lore
loreRouter.post('/learn', Common.middleware.requireCharacter, (req, res, next) => {
  return req.user.activeChar.addKnowledge(res.locals.lore)
  .then(knowledge => {
    res.locals.lore.hidden = false
    if(req.requestType('json')) return res.json(res.locals.lore)
    if(req.requestType('xhr')) return res.render('lore/_lore.jade')
  })
});

// learn a piece of lore
loreRouter.get('/teach', Common.middleware.requireCharacter, (req, res, next) => {
  return req.user.activeChar.hasKnowledge(res.locals.lore)
  .then(hasKnowledge => {
    if(!hasKnowledge) throw Common.error.request("You can't teach what you don't know.")

    return req.user.activeChar.getMembership({
      include:[{
        model:db.Character,
        as:'members',
        where: {id: {$ne: req.user.activeChar.id}},
        include: [{model:db.Lore, as: 'knowledge'}]
      }]
    })
    .then(factions => {
      if(req.requestType('modal')) return res.render('lore/modals/teach',{factions:factions})
      return next()
    })
  })
  .catch(next)
});

// teach a piece of lore
loreRouter.post('/teach', Common.middleware.requireCharacter, (req, res, next) => {
  console.log(req.body.pc)
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
