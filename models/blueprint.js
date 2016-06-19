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
    }
  }, {
    classMethods: {
      associate: function(models) {
        // Item.belongsTo(models.Character, {as: 'owner',foreignKey:'userId'})
      }
    }
  });

  return Blueprint;
};
