var express = require('express');
var router = express.Router();

router.get('/', Common.middleware.requireCharacter, (req,res,next) => {

  return res.locals.character.getRelationship()
  .then(relationships => {
    res.locals.character.Relationships = relationships
    console.log(res.locals.character.Relationships)
    return res.render('characters/relationship/index')
  })
  .catch(next)

})

router.post('/', Common.middleware.requireCharacter, (req,res,next) => {

  return req.user.getMainChar()
  .then(activeChar => {
    return activeChar.addRelationship(res.locals.character,{quality:req.body.quality})
  })
  .then(results => {
    console.log(results)
    return res.send(results)

  })
  .catch(next)

  return next()

})

router.get('/new', (req,res,next) => {

  console.log(db.getInstanceMethods(res.locals.character))

  return req.user.getMainChar()
  .then(activeChar => {
    return db.Character.relationships([activeChar, res.locals.character])
    .then(relationships => {
      res.locals.activeChar = activeChar

      if(req.requestType('modal')) return res.render('characters/_connect.jade')
    })
  })
  .catch(next)

})

module.exports = router;
