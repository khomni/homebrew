var express = require('express');
var router = express.Router();
var models = require('../models');

var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);

router.get('/', (req, res, next) => {
  res.render('index');
});


router.get('/theme', (req,res,next) => {
  if(req.modal) return res.render('settings/theme')
  return next();
})

router.post('/theme', (req,res,next) => {
  req.session.theme = req.body.theme
  if(req.session.theme == 'default') delete req.session.theme

  if(req.json) return res.send(req.body)
  return res.send(req.body)
})

module.exports = router;
