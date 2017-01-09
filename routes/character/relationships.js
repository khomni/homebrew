var express = require('express');
var router = express.Router();

router.get('/', Common.middleware.requireCharacter, (req,res,next) => {

  return res.locals.character.getRelationship()
  .then(relationships => {
    res.locals.character.Relationships = relationships
    return res.render('characters/relationship/index')
  })
  .catch(next)

})

router.post('/', Common.middleware.requireCharacter, (req,res,next) => {

  return req.user.activeChar.addRelationship(res.locals.character,{quality:req.body.quality})
  .then(results => {
    return res.send(results)
  })
  .catch(next)

  return next()

})

router.get('/new', Common.middleware.requireCharacter, (req,res,next) => {

  return db.Character.relationships([req.user.activeChar, res.locals.character])
  .then(relationships => {
    // res.locals.activeChar = req.user.activeChar

    if(req.requestType('modal')) return res.render('characters/_connect.jade')
  })
  .catch(next)

})

module.exports = router;
