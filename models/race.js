"use strict";

// DMs will be able to create custom races

module.exports = function(sequelize, DataTypes) {
  var Race = sequelize.define("Race", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    },
    description: { //
      type: DataTypes.TEXT,
    }

  }, {
    classMethods: {
      associate: function(models) {
        Race.hasMany(models.Bonus)
      }
    }
  });

  return Race;
};
