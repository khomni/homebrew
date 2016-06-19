"use strict";

module.exports = function(sequelize, DataTypes) {
  var Blueprint = sequelize.define("Blueprint", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slot: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['slotless']
    },
    baseSize: {
      type: DataTypes.ENUM,
      values: ['fine','diminutive','tiny','small','medium','large','huge','gargantuan','colossal']
    },
    baseWeight: {
      type: DataTypes.INTEGER,
      values: ['fine','diminutive','tiny','small','medium','large','huge','gargantuan','colossal']
    },
  }, {
    classMethods: {
      associate: function(models) {
        Blueprint.hasMany(models.Bonus) // bonuses inherent to the item type (armor bonus, etc)
      }
    }
  });

  return Blueprint;
};
