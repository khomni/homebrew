"use strict";

module.exports = function(sequelize, DataTypes) {
  var Character = sequelize.define("Character", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        Character.belongsTo(models.User);
        Character.belongsTo(models.Party);
        Character.belongsTo(models.Campaign);

        // Character.hasMany(models.Items);
      }
    }
  });

  return Character;
};
