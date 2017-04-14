'use strict';

const express = require('express');
let router = express.Router();

let Pathfinder = require('~/system/pathfinder');

// Pathfinder initiative tool
router.get('/initiative', (req,res,next) => {
  return res.render('../system/pathfinder/views/initiative')
})

module.exports = router;
