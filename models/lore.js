"use strict";

const { ModelWrapper } = Common.models;

const marked = require('marked');

/* LORE
    The crux of the knowledge system for this platform.
    Each record in the lore table represents a single insular fact.

    Every instance in the database should be 'knowable' by characters.
    Anything resembling a description should be handled in the form of a lore record.
    Anything that is lorable should have a 'name' field that returns an appropriate label for the thing
*/

module.exports = ModelWrapper('Lore', DataTypes => ({
// module.exports = function(sequelize, DataTypes) {
    // The body of the lore, this can be a body of text of any length
    lorable: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.TEXT,
    },
    hidden: {type: DataTypes.VIRTUAL},
    new: {type: DataTypes.VIRTUAL},
    owned: {type: DataTypes.VIRTUAL},
    // lore obscurity represents the likelihood of a person knowning it
    // a piece of lore with an obscurity of 0 is common knowledge
    // (think DC for knowledge checks)
    obscure: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    slug: null,
    name: null,
}), { 
  freezeTableName: true,
}, Lore => {

  Lore.associate = function(models) {

    Lore.belongsToMany(models.Character, {as: 'knowledge', through: models.Knowledge});

    Lore.belongsToMany(models.User, {
      as: 'permission', 
      foreignKey: 'permission_id',
      through: {
        model: models.Permission,
        scope: {
          permissionType: 'Lore'
        },
        constraints: false,
      },
      constraints: false,
    })

    Lore.addScope('defaultScope', {
      sort: [['updatedAt','DESC']]
    }, {override:true} )

  }
  return Lore
});
