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
    status: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      values: ['complete','active','failed']
    },
    visible: {
      type: DataTypes.BOOLEAN,
    }
  }, {
    classMethods: {
      associate: function(models) {
        // a quest can reference a parent quest if it is a subquest
        Quest.belongsToMany(models.Quest, {as: 'quests', through:models.QuestLink});
      }
    }
  });

  return Quest;
};
