"use strict";

/* JOURNAL
    Similar to lore, but localized to a character and comprised entirely of user content.
    A 'journal' instance is an individual journal entry belonging to a single character.
    A journal entry is only visible to that character (unless they share it).
    A journal entry may refer to another thing that is journalable.


    Every instance in the database should be 'knowable' by characters.
    Anything resembling a description should be handled in the form of a lore record.

*/

module.exports = function(sequelize, DataTypes) {
  var Journal = sequelize.define("Journal", {
    // The body of the lore, this can be a body of text of any length
    title: {
      type: DataTypes.STRING
    },
    body: {
      type: DataTypes.TEXT,
    },

  }, {
    freezeTableName: true,
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Journal;
};
