"use strict";

module.exports = function(sequelize, DataTypes) {
  var QuestLink = sequelize.define("QuestLink", {
    subquest: { // Boolean indicating if the linked quest is a child of the quest
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    classMethods: {
      associate: function(models) {
        // a quest can reference a parent quest if it is a subquest
      }
    }
  });

  return QuestLink;
};
