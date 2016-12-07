"use strict";

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
      }
    }
  }, {
    classMethods: {
      associate: function(models) {
        Campaign.hasMany(models.Quest);
        Campaign.belongsTo(models.User, {as: 'Owner'});
      }
    }
  });

  Campaign.hook('beforeCreate', (campaign, options) => {
    if(!campaign.url) campaign.url = campaign.name
    .replace(/[^a-zA-Z0-9_-\s]/gi,'') // remove unsafe characters (except whitespace)
    .split(/\s+/) //split by whitespace
    .reduce((a,b)=>{ // make sure only complete words are encoded
      var length = a.reduce((a,b) => {return a+b.length+1},0)
      if(length + b.length < 32) a.push(b)
      return a
    },[]).join('-')

    return Promise.resolve()
  })

  Campaign.Instance.prototype.ownedBy = function(user) {
    return user.id === this.OwnerId
  }

  return Campaign;
};
