var express = require('express');
var router = express.Router();

// LORE ROUTER
// mount this router onto
// declare `res.locals.lorable` to choose a lorable item to work with

// this will reach the knowledge router and insert the lorable object
router.use('/knowledge',require('../character/knowledge'))

// get all the lore the lore from the lorable object
router.get('/', Common.middleware.requireCharacter, (req, res, next) => {
  if(!res.locals.lorable) return next(); // no lorable item!
  if(!res.locals.lorable.getLore) return next(Common.error.request('That resource cannot have lore'))

  console.log(db.methods(res.locals.lorable,/lore/gi))
  console.log(db.methods(req.user.activeChar,/knowledge/gi))

  return res.locals.lorable.getLore()
  .then(lore => {
    return Promise.map(lore, piece => {
      return req.user.activeChar.hasKnowledge(piece)
      .then(hasKnowledge => {
        if(!hasKnowledge) {
          if(piece.obscurity == 0) return req.user.activeChar.addKnowledge(piece)
          piece.hidden = true
        }
        return piece
      })
    })
    .then(filtered => {
      console.log(filtered)
      if(req.requestType('json')) return res.json(filtered)
      if(req.requestType('modal')) return res.render('lore/modals/list',{title: res.locals.lorable.name, loreList:filtered})
      return res.json(filtered)
    })

  })
  .catch(next)
});

// lore index when no lorable has been added
// defaults to obtaining the lore the active character knows
router.get('/', Common.middleware.requireCharacter, (req,res,next) => {
  return res.redirect('/knowledge');
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

router.get('/:id', Common.middleware.requireCharacter, (req, res, next) => {

  return db.Lore.findOne({where:{id:req.params.id}})
  .then(lore => {
    if(!lore) throw null
    return req.user.activeChar.hasKnowledge(lore)
    .then(hasKnowlege => {
      if(hasKnowlege) return lore
      if(lore.obscurity == 0) return req.user.activeChar.addKnowledge(lore)
      throw Common.error.request(req.user.activeChar.getName('first') + " does not know this")
    })
    .then(lore => {
      return res.json(lore)
    })
  })
  .catch(next)
});

module.exports = router;
