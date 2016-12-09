"use strict";

/* COMMENT
    Comments are any interaction to a commentable document:
      - Journals
      - Quests
      - Lore
*/

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define("Comment", {
    commentable: { // the model being commented on
      type: DataTypes.STRING
    },
    body: {
      type: DataTypes.TEXT,
    },
  }, {
    defaultScope: {
      order: [['createdAt','DESC']]
    },
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        Comment.hasOne(models.Character) // all comments have a
      }
    }
  });

  return Comment;
};
