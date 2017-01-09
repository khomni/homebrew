"use strict";

// Factions

module.exports = function(sequelize, DataTypes) {
  var Faction = sequelize.define("Faction", {
    // User-readable name of the location
    name: {
      type: DataTypes.STRING,
      get: function(){
        return this.getDataValue('name') || "Party"
      }
    },
  }, {
    classMethods: {
      associate: function(models) {
        Faction.belongsTo(models.Character, {as: "leader"});

        Faction.belongsToMany(models.Character, {as: "members", through: models.Membership})
      }
    }
  });

  return Faction;
};
