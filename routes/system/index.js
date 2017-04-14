'use strict';

var express = require('express');
var router = express.Router();

// index for all currently supported systems
router.get('/', (req, res, next) => {
  return next();
});

router.use('/pathfinder', require('./pathfinder'));

// TODO: develop configuration files that allow systems to be added / removed via modular configuration files

let systemRouter = express.Router({mergeParams: true});

router.use('/:system', (req,res,next) => {
  res.locals.activeSystem = req.params.system
  return next();
}, systemRouter);

systemRouter.get('/bestiary', (req,res,next) => {
  return next();
})


module.exports = router;
