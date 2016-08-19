var express = require('express');
var router = express.Router();
var db = require('../models');

var bestiary = require(APPROOT+'/system/bestiary');

/* GET users listing. */
router.get('/bestiary', (req, res, next) => {
  res.send(bestiary);

});

router.get('/bestiary/search',(req,res,next) => {
  res.render('reference/bestiary')
});

router.post('/bestiary/search',(req,res,next) => {
  random = bestiary[Math.floor(Math.random()*bestiary.length)]
  console.log(random)
  res.render('reference/_creatureBlock',{creature: random})
});

router.get('/bestiary/random',(req,res,next) => {
  random = bestiary[Math.floor(Math.random()*bestiary.length)]
  encoded = decodeURIComponent(random.name.toLowerCase().replace(/\s/gi,"-"))
  console.log(encoded)
  return res.redirect('/reference/bestiary/'+encoded)
});

router.get('/bestiary/:id',(req,res,next) => {
  id = req.params.id
  if(isNaN(id)) return next()
  creature = bestiary[id]
  if(creature) {
    return res.render('reference/creatureBlock',{creature: creature})
  } else {
    return next();
  }
});

router.get('/bestiary/:name',(req,res,next) => {
  name = req.params.name.split('-').join(' ')
  names = bestiary.map(function(b){return b.name.toLowerCase()})
  creature = bestiary[names.indexOf(name)]
  if(creature) {
    return res.render('reference/creatureBlock',{creature: creature})
  } else {
    return next();
  }
});


module.exports = router;
