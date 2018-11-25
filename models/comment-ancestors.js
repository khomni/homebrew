"use strict";

module.exports = function(sequelize, DataTypes) {
  var QuestAncestor = sequelize.define('CommentAncestor', {
    CommentId: {
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
