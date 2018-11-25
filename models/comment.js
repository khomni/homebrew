"use strict";

const { ModelWrapper } = Common.models;

/* COMMENT
    Comments are any interaction to a commentable document:
      - Journals
      - Quests
      - Lore
*/

module.exports = ModelWrapper('Comment', DataTypes => ({ 
    commentable: { // the model being commented on
      type: DataTypes.STRING
    },
    body: {
      type: DataTypes.TEXT,
      allowNull:false
    },
    // instead of deleting comments, in order to preserve hierarchy they are to be archived instead
    // archived comments do not show any of the comment's details but will still show up in the hierarchy of a resource's comments
    archived: {
      type:DataTypes.BOOLEAN,
      defaultValue: false,
    }
}), { 
  defaultScope: {
    order: [['createdAt','DESC']]
  },
  freezeTableName: true
}, Comment => {
  Comment.associate = function(models) {
    // all comments either have a speaking character or a speaking user
    Comment.belongsTo(models.Character)
    Comment.belongsTo(models.User)
  }
  Comment.isHierarchy({
    through: 'CommentAncestor',
    childrenAs: 'comments'
  });
  return Comment;
})
