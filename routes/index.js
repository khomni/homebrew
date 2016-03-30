var express = require('express');
var router = express.Router();
var models = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
  models.User.findAll({
  }).then(function(users){
    console.log(users);
    res.render('index', {users: users})
  })
});

module.exports = router;
