"use strict";

const bcrypt = require('bcrypt-nodejs');
Promise.promisifyAll(bcrypt);

module.exports = function(sequelize, DataTypes) {
  var Campaign = sequelize.define("Campaign", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
    },
    url: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: [0,32]
      },
      set: function(val) {
        val = val.replace(/[^a-zA-Z0-9_-\s]/gi,'').split(/\s+/).reduce((a,b)=>{ // make sure only complete words are encoded
          var length = a.reduce((a,b) => {return a+b.length+1},0)
          if(length + b.length < 32) a.push(b)
          return a
        },[]).join('-')
        this.setDataValue('url',val)
      },
      get: function() {
        return '/c/' + (this.getDataValue('url') || this.id) + "/"
      }
    },
    owned: {
      type: DataTypes.VIRTUAL
    },
    // string describing what rules system the campaign uses
    // TODO: validate based on internal source files and build out system support
    system: {
      type: DataTypes.STRING,
      values: SYSTEM.names
    },

    // privacy level determines what other users can see
    // 'hidden' - Campaign is completely invisible to those who haven't been invited
    // 'private' - Campaign can be found through searches and users can request access, but resources are hidden to public
    // 'public' - all campaign resources are visible to public, but users still need to add characters 
    privacy_level: {
      type: DataTypes.STRING,
      values: ['hidden','private','public'],
    },

    // if a password is present, users need to provide it to gain access before adding characters
    password: {
      type: DataTypes.STRING
    }
    // an optional JSONB field for describing your campaign world's proprietary time system,
    // TODO: for more details on valid JSON formats, read accompanying documentation
  }, {
    classMethods: {
      associate: function(models) {
        Campaign.hasMany(models.Quest);
        Campaign.hasMany(models.Location);
        Campaign.hasMany(models.Faction, {constraints:false, onDelete:'cascade'});
        Campaign.hasOne(models.Calendar, {onDelete:'cascade'});
        Campaign.belongsTo(models.User, {as:'owner', onDelete:'cascade'});

        Campaign.belongsToMany(models.User, {
          as: 'permission', 
          foreignKey: 'permission_id',
          through: {
            model: models.Permission,
            scope: {
              permissionType: 'Campaign'
            }
          }
        });

        Campaign.addScope('defaultScope', {
          include: [{model: models.Calendar}]
        }, {override:true} )

        Campaign.addScope('session', {
          attributes: ['id','url','system','name']
        }, {override:true} )
      }
    }
  });

  Campaign.hook('beforeSave', (campaign, options) => {
    return Promise.try(()=>{
      if(campaign.url) return;
      campaign.url = campaign.name
      .replace(/[^a-zA-Z0-9_-\s]/gi,'') // remove unsafe characters (except whitespace)
      .split(/\s+/) //split by whitespace
      .reduce((a,b)=>{ // make sure only complete words are encoded
        var length = a.reduce((a,b) => {return a+b.length+1},0)
        if(length + b.length < 32) a.push(b)
        return a
      },[]).join('-')
      return;
    })
  })

  return Campaign;
};
