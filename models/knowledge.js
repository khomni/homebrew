"use strict";

/* Knowledge
    The join table for characters and lore.
    Contains a timestamp indicating when something was learned

*/

module.exports = function(sequelize, DataTypes) {
  var Knowledge = sequelize.define("Knowledge", {
    // The body of the lore, this can be a body of text of any length
  }, {
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Knowledge;
};
