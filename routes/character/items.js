var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL
router.use((req,res,next)=> {
  res.locals.THEME = req.session.theme || 'stone'
  return req.character.getItems()
  .then(items => {
    req.character.Items = items
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

  db.Journal.create({
    title: req.body.title,
    body: req.body.body,

  })
  .then(function(journal){
    return req.character.addJournal(journal)
  })
  .then(function(){

    return res.redirect(req.headers.referer || req.baseUrl)
  })

})

router.get('/new', Common.middleware.requireCharacter, (req,res,next) => {

  if(req.requestType('modal')) return res.render('characters/journal/modals/edit',{character:req.character, entry:null})
  return res.render('character/journal/edit',{character:req.character})

})

router.get('/:id', (req,res,next) => {
  db.Journal.findOne({
    where: {id:req.params.id}
  })
  .then(function(entry){
    if(req.requestType('modal')) return res.render('characters/journal/modals/entry',{character:req.character, entry:entry})
    return res.render('characters/journal/entry',{character:req.character, entry:entry})
  })
});

router.get('/:id/edit', Common.middleware.requireCharacter, (req,res,next) => {
  db.Journal.findOne({
    where: {id:req.params.id}
  })
  .then(function(entry){
    if(req.requestType('modal')) return res.render('characters/journal/modals/edit',{character:req.character, entry:entry})
    return res.render('characters/journal/edit',{character:req.character, entry:entry})
  })
});

router.post('/:id', Common.middleware.requireCharacter, (req,res,next) => {
  return db.Journal.findOne({where: {id:req.params.id}})
  .then(entry => {
    for(key in req.body) entry[key] = req.body[key]
    return entry.save()
  })
  .then(entry => {
    if(req.requestType('modal')) return res.render('characters/journal/_entry',{character:req.character, entry:entry})
    return res.redirect(req.baseUrl)
  })
  .catch(next)
})

router.delete('/:id', Common.middleware.requireCharacter, (req,res,next) => {
  return db.Journal.findOne({where: {CharacterId: req.character.id, id:req.params.id}})
  .then(entry => {
    if(!entry) throw null
    return req.character.hasJournal(entry)
    .then(owned => {
      if(!owned) throw Common.error.authorization('You')
    })

    if(req.requestType('json')) return res.send(entry)
    if(req.requestType('modal')) return res.render('modals/_success')
    return res.redirect(req.baseUrl);
  })
  .catch(next)
})

module.exports = router;
