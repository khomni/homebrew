"use strict";

module.exports = function(sequelize, DataTypes) {
  var QuestAncestor = sequelize.define('QuestAncestor', {
    QuestId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    ancestorId: {
      type: DataTypes.STRING,
      foreginKey: true
    }
  });

  return QuestAncestor;
};
