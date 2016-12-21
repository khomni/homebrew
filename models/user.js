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
      validPassword: function(password, passwd, done, user){
        bcrypt.compare(password, passwd, function(err, isMatch){
          if(err) return done(err);
          if(isMatch) return done(null,user)
          return done(null,false)
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

  // returns true if a user owns a character owns the character or campaign
  // OR if the user owns the campaign that the character belongs to
  User.Instance.prototype.controls = Promise.method(function(resource) {
    var thisUser = this
    if(thisUser.admin) return [true,{ownership:true, domain:true}]
    if(resource.$modelOptions) {
      var resourceType = resource.$modelOptions.name.singular
      if(resourceType === 'Character') {
        return Promise.props({
          owned: thisUser.hasCharacter(resource),
          dominion: resource.getCampaign().then(campaign=>{return thisUser.hasCampaign(campaign)})
        }).then(results =>{ //
          return [results.owned||results.dominion, results]
        })
      }

      if(resourceType === 'Campaign') {
        returnthisUser.hasCampaign(resource)
      }

    }

    throw new Error('The provided argument is not a controllable resource')

  });

  return User;
};
