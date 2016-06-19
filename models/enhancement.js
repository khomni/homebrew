"use strict";

// Magical item enhancements

module.exports = function(sequelize, DataTypes) {
  var Enhancement = sequelize.define("Enhancement", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    casterLevel: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1
      }
    },
    school: {
      type: DataTypes.ENUM,
      values: ['abjuration','conjuration','divination','Enhancement','evocation','illustion','necromancy','transmutation']
    },
    enhancementBonus: { // the Enhancement bonus equivalent (if applicable)
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    priceModifier: { // additional price modifiers (if applicable)
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Enhancement;
};
