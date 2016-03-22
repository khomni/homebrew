"use strict";

module.exports = function(sequelize, DataTypes) {
  var Party = sequelize.define("Party", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    // name: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   validate: {
    //     len: [1,32]
    //   }
    // }
  }, {
    classMethods: {
      associate: function(models) {
        Party.hasOne(models.Character, {as: 'leader'})
        Party.hasMany(models.Character);
        Party.belongsTo(models.Campaign);
      }
    }
  });

  return Party;
};
