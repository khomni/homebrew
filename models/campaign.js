"use strict";

module.exports = function(sequelize, DataTypes) {
  var Campaign = sequelize.define("Campaign", {
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
        Campaign.hasMany(models.Quest);
        Campaign.belongsTo(models.User, {as: 'Owner'});
      }
    }
  });

  return Campaign;
};
