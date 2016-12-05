var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL
router.use((req,res,next)=> {
  res.locals.THEME = req.session.theme || 'journal'
  return req.character.getJournals()
  .then(journals => {
    req.character.Journals = journals
    return next();
  })
  .catch(next)
})

/* GET users listing. */
router.get('/', Common.middleware.requireCharacter, (req, res, next) => {

  return res.render('characters/journal/index',{character:req.character})
  return res.send(req.character.Journals)
});

router.post('/', Common.middleware.requireCharacter, (req,res,next) => {

  return db.Journal.create({
    title: req.body.title,
    body: req.body.body,
  })
  .then(function(journal){
    return req.character.addJournal(journal)
  })
  .then(function(){
    return res.redirect(req.headers.referer || req.baseUrl)
  })
  .catch(next)

})

router.get('/new', Common.middleware.requireCharacter, (req,res,next) => {

  if(req.requestType('modal')) return res.render('characters/journal/modals/edit',{character:req.character, entry:null})
  return res.render('character/journal/edit',{character:req.character})

})

router.use('/:id', (req,res,next) => {
  return db.Journal.findOne({where: {CharacterId: req.character.id, id:req.params.id}})
  .then(entry => {
    if(!entry) throw Common.error.notfound('Journal entry')
    res.locals.entry = entry
    throw null
  })
  .catch(next)
})

router.get('/:id', (req,res,next) => {
  if(req.requestType('modal')) return res.render('characters/journal/modals/entry',{character:req.character})
  return res.render('characters/journal/entry',{character:req.character})
});

router.get('/:id/edit', Common.middleware.requireCharacter, (req,res,next) => {
  if(req.requestType('modal')) return res.render('characters/journal/modals/edit',{character:req.character})
  return res.render('characters/journal/edit',{character:req.character})
});

router.post('/:id', Common.middleware.requireCharacter, (req,res,next) => {
  for(key in req.body) res.locals.entry[key] = req.body[key]

  return res.locals.entry.save()
  .then(entry => {
    res.locals.entry = entry

    if(req.requestType('modal')) return res.render('characters/journal/_entry',{character:req.character, entry:entry})
    return res.redirect(req.baseUrl)
  })
  .catch(next)

})

router.delete('/:id', Common.middleware.requireCharacter, (req,res,next) => {

  return req.character.hasJournal(res.locals.entry)
  .then(owned => {
    if(!owned) throw Common.error.authorization('You')

    if(req.requestType('json')) return res.send(entry)
    if(req.requestType('modal')) return res.render('modals/_success')
    return res.redirect(req.baseUrl);
  })
  .catch(next)
})

module.exports = router;
