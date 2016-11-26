"use strict";

/* LOCATION
    the Location table stores a record of all physical locatiosn of a locatable things
    storing location separately allows for any number of schemas to be queried by location
*/

module.exports = function(sequelize, DataTypes) {
  var Location = sequelize.define("Location", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    coordinates: {
      type: DataTypes.GEOGRAPHY
    },
  }, {
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Location;
};
