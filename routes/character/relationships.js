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

  return req.user.MainChar.addRelationship(res.locals.character,{quality:req.body.quality})
  .then(results => {
    if(req.json) return res.json(results)
    if(req.xhr) return res.set('X-Redirect', req.headers.referer).sendStatus(302);
    return res.redirect(req.headers.referer);
  })
  .catch(next)

})

router.get('/new', Common.middleware.requireCharacter, (req,res,next) => {

  return db.Character.relationships([req.user.MainChar, res.locals.character])
  .then(relationships => {
    // res.locals.activeChar = req.user.MainChar

    if(req.modal) return res.render('characters/_connect.jade')
  })
  .catch(next)

})

module.exports = router;
