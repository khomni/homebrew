"use strict";

module.exports = function(sequelize, DataTypes) {
  var Quest = sequelize.define("Quest", {
    identifier: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        Quest.belongsTo(models.Party);
        Quest.belongsTo(models.Campaign);
      }
    }
  });

  return Quest;
};
