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
      allowNull:false
    },
  }, {
    defaultScope: {
      order: [['createdAt','DESC']]
    },
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        // all comments either have a speaking character or a speaking user
        Comment.belongsTo(models.Character)
        Comment.belongsTo(models.User)
      }
    }
  });
  Comment.isHierarchy({childrenAs: 'comments'});

  return Comment;
};
