'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const sequelize = require('../config/database');
const EventEmitter = require('events')

const db = {};

fs.readdirSync(__dirname)
.filter(file => {
  return (file.indexOf('.') !== 0) && (file !== basename) && ((file.slice(-3) === '.js') || (file.indexOf('.') < 0));
})
.forEach(file => {
  let model = sequelize.import(path.join(__dirname, file));
  db[model.name] = model
});

db._connection = new EventEmitter();

db._associate = function(){
  for(let key in db) {
    if(db[key].associate) {
      db[key].associate(db)
    }
  }
}

// associates the models and syncs to the database
db._sync = Promise.method(() =>{

  db._associate();

  return sequelize.sync({force:CONFIG.database.forcesync})
  .catch(err => console.log(err))
  .then(syncResults => {
    // individually check to make sure the model associations are valid
    return syncResults;
  })
});

db._methods = function(doc, regex) {
  let methods = []
  for(let key in doc) if(typeof doc[key] === 'function') methods.push(key)
  if(regex && regex instanceof RegExp) methods = methods.filter(method => regex.test(method))
  console.log(doc.$modelOptions.name.singular, methods.sort().join(', ').grey)
  return methods
}

db._sync()
.then(models => {
  console.log(colors.magenta('['+CONFIG.database.options.host + '/' + CONFIG.database.name+'] connected'))
  db._connection.synced = true
  db._connection.emit('synced')
})
.catch(err => {
  console.error('sync error:', err.stack)
  db._connection.emit('error', err)
})

module.exports = db

module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
