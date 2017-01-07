"use strict";

module.exports = function(sequelize, DataTypes) {
  var Item = sequelize.define("Item", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    // current HP of item instance (max is determined by properties and material)
    name : {
      type: DataTypes.STRING,
    },
    hp: {
      type: DataTypes.INTEGER,
      validate : {
        min: 0,
      }
    },
    // value of the object in whichever currency the campaign setting is
    value: {
      type: DataTypes.DECIMAL,
      set: function(v){
        this.setDataValue('value',Number(v))
      },
      validate: {
        min: 0,
      }
    },
    // weight of the object in lbs
    weight: {
      type: DataTypes.DECIMAL,
      validate: {
        min: 0,
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
      }
    },
    // quality of the item instance where 0 is mundane
    rarity: {
      type: DataTypes.INTEGER,
      default: 0,
    },
    // boolean indicating if the item is one-of-a-kind
    unique: {
      type: DataTypes.BOOLEAN,
      default: false
    },
    location: {
      type: DataTypes.GEOGRAPHY
    },
    // an arbitrary JSON object describing the static properties of an item that are inessential for the database (dependent on system)
    // things that may be contained in the properties object:
    //  - Reference to item blueprints or slot in system files
    //  - Caster Level / Aura / School of item
    //  - Miscellaneous properties or bonuses granted by item
    properties: {
      type: DataTypes.JSONB,
    }
  }, {
    classMethods: {
      associate: function(models) {

        // an item may or may not have a location if it is not owned
        // Item.hasOne(models.Location,{
        //   foreignKey: 'locatable_id',
        //   scope: {
        //     locatable: 'Item'
        //   }
        // });

        // an item can have any number of lore items associated with it
        Item.hasMany(models.Lore,{
          as: 'lore',
          foreignKey: 'lorable_id',
          scope: {
            lorable: 'Item'
          }
        });
      }
    }
  });

  return Item;
};
