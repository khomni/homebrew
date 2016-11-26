"use strict";

/* blueprint.js
    Object blueprints are the prototype for object instances
    one blueprint > many instances
    an instance builds upon the blueprint default

    e.g.
    A blueprint would be Longsword, an instance could be Flaming Longsword +2
*/

module.exports = function(sequelize, DataTypes) {
  var Blueprint = sequelize.define("Blueprint", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    // the name of a blueprint is the primary identifier, e.g. 'Longsword' or 'Bookshelf' or 'Potion' or 'Wand'
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // the slot field is a string describing which slot if any an item can be equipped to
    // default is null for slotless, but a slotless object may still be carried
    slot: {
      type: DataTypes.ENUM,
      allowNull: false,
      defaultValue: null,
      values: ['belt','body','chest','eyes','feet','hands','head','headband','neck','shoulders','writst']
    },
    basehp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // An array of descriptors that will further describe properties of the object prototype
    // e.g. finessable, light, heavy, two-handed, exotic
    descriptors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    // optionally, a baseSize can be provided to indicate what size this item typically is
    // item instances can override this property if they are exceptionally sized
    baseSize: {
      type: DataTypes.ENUM,
      values: ['fine','diminutive','tiny','small','medium','large','huge','gargantuan','colossal']
    },
    // a baseWeight can be provided to indicate how much an item of this type typically weighs
    // the system will use the base weight and base material to calculate weight for instances of different size / composition
    baseWeight: {
      type: DataTypes.INTEGER,
      values: ['fine','diminutive','tiny','small','medium','large','huge','gargantuan','colossal']
    },
    // optionally, a baseMaterial can be provided if the object is comprised primarily of one material
    // if not provided, it will be assumed that the object is made of composite materials and instances cannot be converted
    baseMaterial: {
      type: DataTypes.STRING,
      defaultValue: null,
      values: ['wood', 'steel', 'glass', 'leather'],
    }
  }, {
    classMethods: {
      associate: function(models) {
        Blueprint.hasMany(models.Bonus) // bonuses inherent to the item type (armor bonus, etc)
      }
    }
  });

  return Blueprint;
};
