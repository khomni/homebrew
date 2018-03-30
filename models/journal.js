"use strict";

const marked = require('marked');

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
    title: {
      type: DataTypes.STRING
    },
    body: {
      type: DataTypes.TEXT,
    },
    $body: { // markup version of the body; automatically adds images in the footnotes
      type: DataTypes.VIRTUAL,
      get: function() {
        if(!this.body) return null;
        let processedBody = this.body
        if(this.Images) {
          processedBody += '\r' + this.Images.map((image, i) => `[${i}]: ${image.path}`).join('\n')
        }
        return marked(processedBody)
      }
    },
    // an array of strings that describe what type of relation a user needs to read this entry. By default, journals are only visible to their owner character
    // public: this entry is visible to all site users
    // campaign: this journal is only visible to users whose active character is in the same campaign
    // party: this journal is only visible to users whose active character is in the same party
    visibleTo: {
      type: DataTypes.ENUM,
      values: ['public','party','campaign']
    }
  }, {
    defaultScope: {
      order: [['updatedAt','DESC']]
    },
    freezeTableName: true,
    classMethods: {
      associate: function(models) {

      }
    }
  });

  /*
  Journal.hook('beforeSave', (journal,options) => {
    // search through any pieces of lore that might be referenced in the journal entry and reformat it to be a link
    var words = journal.body.replace(/[\.\!\?](?=\s)/,'').split(/\s+/)
    return db.Character.findAll({
      attributes: ['name'],
      where: {name: {$in: words}}
    })
    .then(characters => {
      return;
    })
    // OR search for character names
  })
  */

  return Journal;
};
