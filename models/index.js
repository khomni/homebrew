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
  console.log(colors.magenta('['+CONFIG.database.name+'] connected'))

  fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });
  console.log(colors.magenta('['+CONFIG.database.name+']',Object.keys(db).length,'models imported'))

  for(key in db) {
    if(db[key].associate) db[key].associate(db)
  }

  // for each model, promise that it will successfully sync and can query results without error
  return Promise.map(Object.keys(db), modelName => {
    // not a sequelize model to sync
    if(!db[modelName] instanceof Sequelize.Model) return Promise.resolve()

    // try syncing the model to the database
    return db[modelName].sync()
    .then(model => {
      // try to query a document in the model
      return model.findOne()
      .then(doc => {
        // query succeeded, return the model
        return model
      })
      .catch(err => {
        // if it's not local, throw a critical error
        if(!process.env.NODE_ENV == 'local') throw err;

        // if it's local, retry the sync with {force: true}
        return model.sync({force:true})
        .then(model=>{
          console.log(colors.black.bgMagenta('['+CONFIG.database.name+']', model.name, 'force resynced'))
          return model
        })
      })
    })
  })
  .then(results => {
    console.log(colors.magenta('['+CONFIG.database.name+']',results.length,'models synced'))

    db.methods = function(doc,regex) {
      var methods = []
      for(key in doc) {
        if(typeof doc[key] == 'function') methods.push(key)
      }
      if(regex && regex instanceof RegExp) methods = methods.filter(method => {return regex.test(method)})

      return methods.sort().join(', ').grey
    }


    db.sequelize = sequelize
    db.Sequelize = Sequelize

    return db
  })
})

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
