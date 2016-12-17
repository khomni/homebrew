var express = require('express');
var router = express.Router();

// LORE ROUTER
// mount this router onto
// declare `res.locals.lorable` to choose a lorable item to work with


// get all the lore the lore from the lorable object
router.get('/', (req, res, next) => {
  if(!res.locals.lorable) return next(); // no lorable item!
  if(!res.locals.lorable.getLore) return next(Common.error.request('That resource cannot have lore'))

  console.log(db.methods(res.locals.lorable,/lore/gi))
  console.log(db.methods(req.user.activeChar,/knowledge/gi))

  return res.locals.lorable.getLore()
  .then(lore => {
    res.locals.lorable.Lore = lore
    console.log(res.locals.lorable)
    return res.json({lorable: lore})

  })
  .catch(next)
});

// lore index when no lorable has been added
router.get('/', (req,res,next) => {
  //
})

// Add lore to the lorable object
router.post('/', (req, res, next) => {
  if(!res.locals.lorable) return next(Common.error.request('Cannot add lore to nothing'))
  if(!res.locals.lorable.createLore) return next(Common.error.request('That resource cannot have lore'))

  // create a bit of lore for the lorable
  return res.locals.lorable.createLore(req.body)
  .then(lore => {

  })
  .catch(next)
});

router.get('/:id', (req, res, next) => {
  db.Lore.findOne({where:{id:req.params.id}})
  .then(lore => {
    return res.json(lore)
  })
  .catch(next)
});




module.exports = router;
