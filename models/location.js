"use strict";

module.exports = function(sequelize, DataTypes) {
  var Location = sequelize.define("Location", {
    // User-readable name of the location
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOGRAPHY,
      defaultValue: { type: 'Point', coordinates: [0,0]}
    },
    // classification used for
    classification: {
      type: DataTypes.ENUM,
      allowNull: true,
      values: ['political','geography','dungeon','building','point of interest']
    }
  }, {
    classMethods: {
      associate: function(models) {
        // a character has lore in the form of their bio and backstory
        Location.hasMany(models.Lore, {
          as: 'lore',
          foreignKey: 'lorable_id',
          scope: {
            lorable: 'Location'
          }
        });
      }
    }
  });

  return Location;
};
