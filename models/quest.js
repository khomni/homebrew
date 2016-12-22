"use strict";

module.exports = function(sequelize, DataTypes) {
  var Quest = sequelize.define("Quest", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,64]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM,
      allowNull:true,
      values: ['complete','active','failed']
    },
    visible: {
      type: DataTypes.BOOLEAN,
    }
  }, {
    // hierarchy: true,
    classMethods: {
      associate: function(models) {
        // a quest can reference a parent quest if it is a subquest
      }
    }
  });
  Quest.isHierarchy();

  return Quest;
};
