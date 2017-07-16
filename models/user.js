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
    url: {
      type: DataTypes.VIRTUAL,
      get: function(){
        return '/u/' + this.username
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
        User.hasMany(models.Character, {as: 'characters', foreignKey: 'ownerId', constraints: false});
        User.belongsTo(models.Character, {as: 'MainChar'});
        User.hasMany(models.Campaign, {foreignKey:'ownerId'});

        User.belongsToMany(models.Campaign, {
          as: 'permission', 
          through: {
            model: models.Permission,
            scope: {
              permissionType: 'Campaign'
            }
          }
        });

        User.belongsToMany(models.Character, {
          as: 'characterPermission', 
          through: {
            model: models.Permission,
            scope: {
              permissionType: 'Character'
            }
          }
        });

        User.addScope('session', {
          attributes: ['id','username'],
          include: [{
            model: models.Character.scope('session'),
            as: 'MainChar'
          }]
        })
      },
    }
  });

  User.validPassword = function(password, passwd, user) {
    return bcrypt.compareAsync(password, passwd)
    .then(isMatch => isMatch && user )
  };

  function hashPassWord(user, options) {
    return Promise.try(()=>{
      if(user.password && !user.changed('password')) return user; // if password wasn't changed, skip the password hashing
      console.log('hashing password')

      options.updatesOnDuplicate = options.updatesOnDuplicate || [];
      options.updatesOnDuplicate.push('password');

      return bcrypt.genSaltAsync(CONFIG.security.SALT_WORK_FACTOR)
      .then(salt => {
        return bcrypt.hashAsync(user.password, salt, null)
        .then(hash => {
          user.password = hash
          return user
        })
      })
    })
  }

  User.hook('beforeSave', hashPassWord);
  User.hook('beforeCreate', hashPassWord);
  User.hook('beforeUpdate', hashPassWord);

  // convenience method for users
  // takes an instance as an argument and returns the permission instance if it exists, returns false otherwise
  // can be used in lieu of hasPermission or getPermission
  User.Instance.prototype.checkPermission = function(instance, options) {
    let thisUser = this;

    let defaultQuery = {through: {where: {permissionType: instance.$modelOptions.name.singular, UserId: thisUser.id}}}
    Object.assign(defaultQuery.through.where, options)

    return instance.getPermission(defaultQuery)
    .then(p => p.pop())
    .then(permission => {
      if(!permission) return permission
      instance.Permission = permission.Permission
      return permission.Permission
    })
  }

  // returns true if a user owns a character owns the character or campaign
  // OR if the user owns the campaign that the character belongs to
  User.Instance.prototype.controls = function(resource) {
    var thisUser = this
    if(thisUser.admin) return {owner:true, permission:true} // admins do whatever they want
    if(resource.$modelOptions) {
      let resourceType = resource.$modelOptions.name.singular

      if(resourceType === 'Character') { // assumes the character has the campaign populated
        if(resource.ownerId == thisUser.id) return {owner:true, permission:true}
        if(resource.Campaign && resource.Campaign.ownerId == thisUser.id) return {owner:false, permission:true}
      }

      if(resourceType === 'Campaign') {
        if(resource.ownerId == thisUser.id) return {owner:true, permission: true}
      }
    }
    return {owner:false, byDominion:false}
  };

  return User;
};
