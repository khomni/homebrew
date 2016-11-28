'use strict';

var Sequelize = require('sequelize');

var sequelize = new Sequelize(CONFIG.database.name, CONFIG.database.username, CONFIG.database.password, CONFIG.database.options)
sequelize.authenticate()
.then(()=>{
  console.log('Connected to:',CONFIG.database.name)
})
.catch((err) => {
  console.error(err.stack)
})

module.exports = sequelize
