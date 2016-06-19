"use strict";

module.exports = function(sequelize, DataTypes) {
  var Item = sequelize.define("Item", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    hp: { // current HP of item instance (max is determined by blueprint and material)
      type: DataTypes.INTEGER,
      allowNull: false,
      validate : {
        min: 0,
      }
    },
    quality: { // quality of the item instance
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['normal','masterwork']
    }
  }, {
    classMethods: {
      associate: function(models) {
        Item.hasOne(models.Blueprint);
        Item.hasOne(models.Material);
        Item.hasMany(models.Enhancement);
        Item.hasMany(models.Bonus);
      }
    }
  });

  return Item;
};
