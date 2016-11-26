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
        Item.hasMany(models.Enhancement);

        // an item may or may not have a location if it is not owned
        Item.hasOne(models.Location);

        // an item can have any number of lore items associated with it
        Item.hasMany(models.Lore,{
          as: 'lore',
          foreignKey: 'lorable_id',
          scope: {
            lorable: 'item'
          }
        });
      }
    }
  });

  return Item;
};
