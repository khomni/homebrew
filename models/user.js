"use strict";

var bcrypt = require('bcrypt-nodejs');

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
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true
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
        User.hasMany(models.Character, {as: 'characters'});
        User.hasOne(models.Character, {as: 'mainChar'})

      },
      validPassword: function(password, passwd, done, user){
        bcrypt.compare(password, passwd, function(err, isMatch){
          if (err) {
            return done(err);
          }
          if (isMatch) {
            done(null, user)
          } else {
            done(null, false)
          }
        })
      }
    }
  });

  User.hook('beforeCreate', function(user, options, callback) {
    options.updatesOnDuplicate = options.updatesOnDuplicate || []
    options.updatesOnDuplicate.push('password')
    var salt = bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
      if(err) return callback(err)
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
        bcrypt.hash(user.password, salt, null, function(err, hash){
          if(err) return callback(err);
          user.password = hash;
          callback(null, user)
        });
      });
    });
  })

  return User;
};
