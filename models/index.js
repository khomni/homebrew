'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var db        = {};

var sequelize = require(APPROOT+'/config/database')

module.exports = sequelize.authenticate()
.then(() =>{
  fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

  Promise.map(Object.keys(db), (modelName) => {
    if (db[modelName].associate) db[modelName].associate(db);
    if(!process.env.NODE_ENV == 'local') return Promise.resolve();
    return db[modelName].findOne()
    .catch(err =>{ // if table encounters an error, force sync it
      console.error(colors.red('[database] model definition error:',err))
      return db[modelName].sync({force:true}).then(results=>{
        console.log('table '+results+' has been resynced')
      })
    })
  })


  Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.getInstanceMethods = function(doc) {
    var methods = []
    for(key in doc) {
      if(typeof doc[key] == 'function') methods.push(key)
    }
    return methods.sort()
  }

  return Promise.map(Object.keys(db),function(modelName){
    if(db[modelName] instanceof Sequelize.Model) {
      return db[modelName].sync()
      .catch(err => {
        console.error(err)
      })
    }
  })
  .then(results => {
    db.sequelize = sequelize
    db.Sequelize = Sequelize
    return db
  })
})

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
