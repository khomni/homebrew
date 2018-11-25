"use strict";

module.exports = function(sequelize, DataTypes) {
  var Relationship = sequelize.define('Relationship', {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    quality: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        len: [-100,100]
      }
    },
  }, {
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Relationship;
};
