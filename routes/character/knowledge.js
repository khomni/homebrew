var express = require('express');
var router = express.Router();

// KNOWLEDGE router
// this router always has `res.locals.character`

// if the router isn't mounted on top of a route with a character, use the active character
// router.use('/',(req,res,next) => {
//   res.locals.character = res.locals.character
//   if(!res.locals.character && req.user && req.user.MainChar) res.locals.character = req.user.MainChar
//   return next()
// })

// get all things this character knows (about a topic, if mounted on top of a lorable router middleware)
router.get('/', Common.middleware.requireCharacter, (req, res, next) => {
  var query = {}

  res.locals.base = res.locals.campaign.url+ "lore"

  // if there is a lorable item in the middleware stack, specify that as the topic
  if(res.locals.lorable) query = {where:{lorable:res.locals.lorable.$modelOptions.name.singular, lorable_id: res.locals.lorable.id}}
  return req.user.MainChar.getKnowledge(query)
  .then(knowledge => {

    if(req.json) return res.json(knowledge)

    var subjects = {}
    knowledge.map(k => {
      subjects[k.lorable] = subjects[k.lorable] || []
      subjects[k.lorable].push(k)
    })

    if(req.xhr) return res.render('lore/_topics',{subjects:subjects})
    if(req.modal) return res.render('lore/modals/list',{loreList:knowledge})
    return res.json(knowledge)
  })
  .catch(next)
});

// learn something new
router.post('/', (req, res, next) => {

  return db.Lore.findOne({where:{id:req.body.id}})
  .then(lore => {
    return res.locals.character.addKnowledge(lore)
    .then(knowledge => {
      return res.json(knowledge)
    })
  })
  .catch(next)

});

module.exports = router;
