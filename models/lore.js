"use strict";

/* LORE
    The crux of the knowledge system for this platform.
    Each record in the lore table represents a single insular fact.

    Every instance in the database should be 'knowable' by characters.
    Anything resembling a description should be handled in the form of a lore record.
    Anything that is lorable should have a 'name' field that returns an appropriate label for the thing

*/

module.exports = function(sequelize, DataTypes) {
  var Lore = sequelize.define("Lore", {
    // The body of the lore, this can be a body of text of any length
    lorable: {
      type: DataTypes.STRING
    },
    content: {
      type: DataTypes.TEXT,
    },
    hidden: {type: DataTypes.VIRTUAL,},
    new: {type: DataTypes.VIRTUAL},
    owned: {type: DataTypes.VIRTUAL},
    // lore obscurity represents the likelihood of a person knowning it
    // a piece of lore with an obscurity of 0 is common knowledge
    // (think DC for knowledge checks)
    obscurity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min:0,
      }
    }
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function(models) {
        Lore.belongsTo(models.User, {as:'author'})
      }
    }
  });

  Lore.Instance.prototype.ownedBy = function(user) {
    return user.id === this.authorId
  }

  return Lore;
};
