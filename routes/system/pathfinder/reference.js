'use strict';

const express = require('express');
let router = express.Router();

let Pathfinder = require('~/system/pathfinder')

router.get('/', (req, res, next) => {
  return res.send(Pathfinder);
});

module.exports = router;
