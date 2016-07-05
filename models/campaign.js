"use strict";

module.exports = function(sequelize, DataTypes) {
  var Campaign = sequelize.define("Campaign", {
    identifier: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        Campaign.hasMany(models.Race);
        Campaign.hasMany(models.Quest);
        Campaign.hasOne(models.User, {as: 'GM'});
      }
    }
  });

  return Campaign;
};
