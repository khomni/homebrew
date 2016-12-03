var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL
router.use((req,res,next)=> {
  res.locals.THEME = 'journal'
  return req.character.getJournals()
  .then(journals => {
    console.log(journals)
    return next();
  })
  .catch(next)
})

/* GET users listing. */
router.get('/', (req, res, next) => {

  return res.render('characters/journal/index',{character:req.character})
  return res.send(req.character.Journals)
});

router.post('/', (req,res,next) => {

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

router.get('/new', (req,res,next) => {

  if(req.requestType('modal')) return res.render('characters/journal/_entry',{character:req.character, entry:null})
  return res.render('character/journal/new',{character:character})

})

router.get('/:id', (req,res,next) => {
  db.Journal.findOne({
    where: {id:req.params.id}
  })
  .then(function(entry){
    if(req.requestType('modal')) return res.render('characters/journal/_entry',{character:req.character, entry:entry})
    return res.redirect(req.baseUrl)
  })
});

router.post('/:id', (req,res,next) => {
  return db.Journal.findOne({where: {id:req.params.id}})
  .then(entry => {
    for(key in req.body) entry[key] = req.body[key]
    return entry.save()
  })
  .then(entry => {
    if(req.requestType('modal')) return res.render('characters/journal/_entry',{character:req.character, entry:entry})
    return res.redirect(req.baseUrl)
  })
})

router.delete('/:id', (req,res,next) => {
  return db.Journal.findOne({where: {id:req.params.id}})
  .then(entry => {
    console.log(entry.get({plain:true}))
    if(req.requestType('modal')) return res.render('characters/journal/_entry',{character:req.character, entry:entry})
    return res.redirect(req.baseUrl);
  })
})

module.exports = router;
