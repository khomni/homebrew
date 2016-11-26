var express = require('express');
var router = express.Router();
var models = require('../models');

var fs = require('fs');
var path = require('path');
var basename = path.basename(module.filename);

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/about', (req, res, next) => {
  res.render('about');
});

router.use('/u',require('./user'));
router.use('/pc',require('./character'));
router.use('/reference',require('./reference'));

module.exports = router;
