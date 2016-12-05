var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL
router.use((req,res,next)=> {
  res.locals.THEME = req.session.theme || 'stone'
  return res.locals.character.getItems()
  .then(items => {
    res.locals.character.Items = items
    return next();
  })
  .catch(next)
})

/* GET users listing. */
router.get('/', Common.middleware.requireCharacter, (req, res, next) => {
  if(req.requestType('json')) return res.send(res.locals.character.Items)
  return res.render('characters/inventory/index')
});

router.post('/', Common.middleware.requireCharacter, (req,res,next) => {
  db.Journal.create({
    title: req.body.title,
    body: req.body.body,
  })
  .then(function(journal){
    return res.locals.character.addJournal(journal)
  })
  .then(() => {
    return res.redirect(req.headers.referer || req.baseUrl)
  })
})

module.exports = router;
