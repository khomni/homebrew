var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL
router.use((req,res,next)=> {
  // res.locals.THEME = req.session.theme || 'journal'
  return res.locals.character.getJournals()
  .then(journals => {
    res.locals.character.Journals = journals
    return next();
  })
  .catch(next)
})

/* GET users journals. */
router.get('/', Common.middleware.requireCharacter, (req, res, next) => {
  if(req.requestType('json')) return res.send(res.locals.character.Journals)
  return res.render('characters/journal/index')
});

router.post('/', Common.middleware.requireCharacter, (req,res,next) => {

  return res.locals.character.createJournal({
    title: req.body.title,
    body: req.body.body
  })
  .then(journal =>{
    return res.redirect(req.headers.referer || req.baseUrl)
  })
  .catch(next)

})

router.get('/new', Common.middleware.requireCharacter, (req,res,next) => {

  if(req.requestType('modal')) return res.render('characters/journal/modals/edit')
  return res.render('character/journal/edit')

})

// the following routers concern an individual journal entry, as referenced by the :id parameter
// the journal entry will be queried by this middleware then added to res.locals.entry

router.use('/:id', Common.middleware.requireCharacter, (req,res,next) => {
  return db.Journal.findOne({where: {CharacterId: res.locals.character.id, id:req.params.id}})
  .then(entry => {
    if(!entry) throw Common.error.notfound('Journal entry')
    return req.user.activeChar.hasJournal(entry)
    .then(owned =>{
      if(!owned) throw Common.error.notfound('Journal entry')
      res.locals.entry = entry
      throw null
    })
  })
  .catch(next)
})

router.get('/:id', (req,res,next) => {
  if(req.requestType('modal')) return res.render('characters/journal/modals/entry')
  return res.render('characters/journal/entry')
});

router.get('/:id/edit', Common.middleware.requireCharacter, (req,res,next) => {
  if(req.requestType('modal')) return res.render('characters/journal/modals/edit')
  return res.render('characters/journal/edit')
});

router.post('/:id', Common.middleware.requireCharacter, (req,res,next) => {
  for(key in req.body) res.locals.entry[key] = req.body[key]

  return res.locals.entry.save()
  .then(entry => {
    res.locals.entry = entry

    if(req.requestType('json')) return res.json(entry)
    if(req.requestType('modal')) return res.render('characters/journal/_entry')
    return res.redirect(req.baseUrl)
  })
  .catch(next)

})

router.delete('/:id', Common.middleware.requireCharacter, (req,res,next) => {

  return res.locals.character.hasJournal(res.locals.entry)
  .then(owned => {
    if(!owned) throw Common.error.authorization('You cannot delete this')

    return res.locals.entry.destroy()
    .then(entry => {

      if(req.requestType('json')) return res.send(res.locals.entry)
      if(req.requestType('modal')) return res.render('modals/_success')
      return res.redirect(req.baseUrl);
    })

  })
  .catch(next)
})

module.exports = router;
