'use strict';

var Sequelize = require('sequelize');
require('sequelize-hierarchy')(Sequelize);

var sequelize = new Sequelize(CONFIG.database.name, CONFIG.database.username, CONFIG.database.password, CONFIG.database.options)

module.exports = sequelize
