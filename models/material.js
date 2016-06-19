"use strict";

module.exports = function(sequelize, DataTypes) {
  var Material = sequelize.define("Material", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hp: { // per inch of thickness
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {min: 1}
    },
    hardness: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {min: 0}
    },
  }, {
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Material;
};
