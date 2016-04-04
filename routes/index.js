var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/about', (req, res, next) => {
  res.render('about');
});

module.exports = router;
