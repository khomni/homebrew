'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var db        = {};

// var config = require(APPROOT + '/config');

var sequelize = new Sequelize(CONFIG.database.name, CONFIG.database.username, CONFIG.database.password, CONFIG.database.options)

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize.authenticate()
.then(function(results){

  if(!CONFIG.database.forcesync) return;

  var seeds = require('../data/seeds');
  var promises = {}

  // TODO: seed database

})
.catch(console.error)

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
