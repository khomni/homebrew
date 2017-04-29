'use strict';

var express = require('express');
var router = express.Router();

// res.locals.activeSystem
router.get('/', (req, res, next) => {
  return next();
});

router.get('/bestiary', (req, res, next) => {
  console.log('bestiary')
  return res.json([])
});

// TODO: develop configuration files that allow systems to be added / removed via modular configuration files

module.exports = router;
