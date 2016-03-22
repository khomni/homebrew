"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isAlphanumeric: true,
        len: [2,16]
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    userType: {
      type: DataTypes.ENUM('gm','player'),
      defaultValue: 'player'
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
    ],
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Character);
      }
    }
  });

  return User;
};
