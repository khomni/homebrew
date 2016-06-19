"use strict";

module.exports = function(sequelize, DataTypes) {
  var Character = sequelize.define("Character", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    },
    race: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    },
    sex: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['male','female','n/a']
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,64]
      }
    },
  }, {
    classMethods: {
      associate: function(models) {
        Character.belongsTo(models.User, {as: 'owner'})
        Character.belongsTo(models.Campaign);
        Character.belongsTo(models.Party);
        Character.hasMany(models.Item);
      }
    }
  });

  return Character;
};
