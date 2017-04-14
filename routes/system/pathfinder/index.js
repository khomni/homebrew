'use strict';

const express = require('express');
let router = express.Router();

let Pathfinder = require('~/system/pathfinder')

router.use((req, res, next) => {
  res.locals.activeSystem = Pathfinder
  return next();
});

router.use('/tools', require('./tools'));
router.use('/reference', require('./reference'));


module.exports = router;
