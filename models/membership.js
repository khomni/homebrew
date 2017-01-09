"use strict";

// Joins Character and Faction

module.exports = function(sequelize, DataTypes) {
  var Membership = sequelize.define("Membership", {
    // User-readable name of the location
  }, {
    classMethods: {
      associate: function(models) {
        // a character has lore in the form of their bio and backstory
        // Faction.hasMany(models.Lore, {
        //   as: 'lore',
        //   foreignKey: 'lorable_id',
        //   scope: {
        //     lorable: 'Faction'
        //   }
        // });
      }
    }
  });

  return Membership;
};
