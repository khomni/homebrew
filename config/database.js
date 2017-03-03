'use strict';

const Sequelize = require('sequelize');
require('sequelize-hierarchy')(Sequelize);

var sequelize = new Sequelize(CONFIG.database.name, CONFIG.database.username, CONFIG.database.password, CONFIG.database.options)

sequelize.authenticate()

module.exports = sequelize
