'use strict';

var express = require('express');
var router = express.Router();

// index for all currently supported systems
router.get('/', (req, res, next) => {
  return next();
});

// TODO: develop configuration files that allow systems to be added / removed via modular configuration files

let systemRouter = express.Router({mergeParams: true});

router.use('/:system', (req,res,next) => {
  if(!(req.params.system in SYSTEM)) return next(Common.error.notfound('System not found'))
  res.locals.activeSystem = SYSTEM[req.params.system]
  return next();
}, systemRouter);

systemRouter.get('/about', (req,res,next) => {
  return res.json(res.locals.activeSystem)
});

systemRouter.use('/reference', require('./reference'));

systemRouter.get('/init', (req,res,next) => {
  return res.render('applet/initiative')
});


module.exports = router;
