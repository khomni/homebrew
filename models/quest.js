"use strict";

module.exports = function(sequelize, DataTypes) {
  var Quest = sequelize.define("Quest", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
  }, {
    classMethods: {
      associate: function(models) {
        Quest.hasMany(models.Quest, {as: 'subQuest'})
      }
    }
  });

  return Quest;
};
