"use strict";

const { ModelWrapper } = Common.models;

const PRIVACY_PUBLIC = 0 // anyone can view and join the group without requesting invitation
const PRIVACY_VISIBLE = 1 // all materials are visible, but permission must be granted to participate
const PRIVACY_PRIVATE = 2 // group can be found in searches, but invitation must be requested to participate
const PRIVACY_HIDDEN = 3 // invitation only; resources are completely hidden without granted read permissions

const bcrypt = require('bcrypt-nodejs');
Promise.promisifyAll(bcrypt);

module.exports = ModelWrapper('Campaign', DataTypes => ({
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1,32]
    }
  },
  url: {
    type: DataTypes.VIRTUAL,
    get: function() {
      return '/c/' + (this.slug || this.id)
    }
  },
  owned: {
    type: DataTypes.VIRTUAL
  },
  // string describing what rules system the campaign uses
  // TODO: validate based on internal source files and build out system support
  system: {
    type: DataTypes.STRING,
    values: SYSTEM.names,
    get: function(){
      let key = this.getDataValue('system')
      return SYSTEM[key]
    }
  },

  // privacy level determines what other users can see
  // 'hidden' - Campaign is completely invisible to those who haven't been invited
  // 'private' - Campaign can be found through searches and users can request access, but resources are hidden to public
  // 'public' - all campaign resources are visible to public, but users still need to add characters 
  privacy_level: {
    type: DataTypes.INTEGER,
    defaultValue: PRIVACY_PUBLIC,
    validate: {
      min: PRIVACY_PUBLIC,
      max: PRIVACY_HIDDEN
    }
  },

  // if a password is present, users need to provide it to gain access before adding characters
  password: {
    type: DataTypes.STRING
  }
}), {}, Campaign => {

  Campaign.associate = function(models) {
    Campaign.hasMany(models.Quest);
    Campaign.hasMany(models.Location);
    Campaign.hasMany(models.Faction, {constraints:false, onDelete:'cascade'});
    Campaign.hasOne(models.Calendar, {onDelete:'cascade'});
    Campaign.belongsTo(models.User, {as:'owner', onDelete:'cascade'});
    Campaign.hasMany(models.Character, {constraints: false});

    Campaign.belongsToMany(models.User, {
      as: 'permission', 
      foreignKey: 'permission_id',
      through: {
        model: models.Permission,
        scope: {
          permissionType: 'Campaign'
        },
        constraints: false,
      },
      constraints: false,
    });

    Campaign.addScope('defaultScope', {
    }, {override:true} )

    Campaign.addScope('calendar', {
      include: [{model: models.Calendar}],
      attributes: ['id','slug','name'],
    })

    Campaign.addScope('session', {
      attributes: ['id','slug','system','name']
    }, {override:true} )
  }

  return Campaign;
});
