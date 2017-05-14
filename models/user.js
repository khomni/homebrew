"use strict";

const bcrypt = require('bcrypt-nodejs');
Promise.promisifyAll(bcrypt)

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
    admin: {
      type: DataTypes.BOOLEAN
    }
  }, {
    scopes: {
      public: {
        attributes: {exclude: ['password','email']}
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
    ],
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Character, {as: 'characters', constraints: false});
        User.belongsTo(models.Character, {as: 'MainChar'});
        User.hasMany(models.Campaign)
      },
      validPassword: function(password, passwd, user){
        return bcrypt.compareAsync(password, passwd)
        .then(isMatch => {
          if(isMatch) return user
          return false
        })
      }
    }
  });

  User.hook('beforeCreate', function(user, options, callback) {
    options.updatesOnDuplicate = options.updatesOnDuplicate || []
    options.updatesOnDuplicate.push('password')
    var salt = bcrypt.genSalt(CONFIG.security.SALT_WORK_FACTOR, function(err, salt){
      if(err) return callback(err)
      bcrypt.genSalt(CONFIG.security.SALT_WORK_FACTOR, function(err, salt){
        bcrypt.hash(user.password, salt, null, function(err, hash){
          if(err) return callback(err);
          user.password = hash;
          callback(null, user)
        });
      });
    });
  })

  // returns true if a user owns a character owns the character or campaign
  // OR if the user owns the campaign that the character belongs to
  User.Instance.prototype.controls = function(resource) {
    var thisUser = this
    if(thisUser.admin) return {owner:true, permission:true} // admins do whatever they want
    if(resource.$modelOptions) {
      let resourceType = resource.$modelOptions.name.singular

      if(resourceType === 'Character') { // assumes the character has the campaign populated
        if(resource.UserId == thisUser.id) return {owner:true, permission:true}
        if(resource.Campaign && resource.Campaign.UserId == thisUser.id) return {owner:false, permission:true}
      }

      if(resourceType === 'Campaign') {
        if(resource.UserId == thisUser.id) return {owner:true, permission: true}
      }

    }

    return {owner:false, byDominion:false}

  };

  return User;
};
