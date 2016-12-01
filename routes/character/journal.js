var express = require('express');
var router = express.Router();

// you can get back to the journal index from this module at any time by rediredting to req.baseURL


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

  if(req.requestType('modal')) return res.render('characters/journal/_entry',{character:req.character, entry:{}})
  return res.render('character/journal/new',{character:character})

})

router.get('/:id', (req,res,next) => {
  db.Journal.findOne({
    where: {id:req.params.id}
  })
  .then(function(entry){
    if(req.requestType('modal')) return res.render('characters/journal/_entry',{character:character, entry:{}})
  })
})

module.exports = router;
