"use strict";

module.exports = function(sequelize, DataTypes) {
  var Character = sequelize.define("Character", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    // character name is an array of strings
    // a character many have a name of any length
    name: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
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
      validate: {
        len: [1,64]
      }
    },
    npc: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    getterMethods: {
      name: function(input){
        console.log('this:',this)
        console.log('input:',input)
        var nameArray = this.getDataValue('name')
        if(nameArray) return nameArray.join(' ');
      }
    },
    setterMethods : {
      name: (string) => {
        return string.split(' ')
        // this.setDataValue('name', string.split(' '))
      }
    },
    classMethods: {
      associate: (models) => {
        // a character is part of a campaign, so it contains a reference to that campaign
        Character.belongsTo(models.Campaign, {constraints: false});
        // a user account has a designated main character
        // Character.hasOne(models.User, {as: 'mainChar'});

        // a character is a locable thing, so it has a location record
        Character.hasOne(models.Location);
        // a character has lore in the form of their bio and backstory
        Character.hasMany(models.Lore, {
          as: 'lore',
          foreignKey: 'lorable_id',
          scope: {
            lorable: 'character'
          }
        });

        // Character.belongsTo(models.Party);
        Character.belongsToMany(models.Character, {as: 'relationship',through: models.Relationship});
        // a character has access to some pieces of lore, the association being 'knowledge'
        Character.belongsToMany(models.Lore, {as: 'knowledge', through: models.Knowledge});

        // items tend to belong to characters, so they can have an owner in their record
        Character.hasMany(models.Item);

      }
    }
  });

    Character.hook('beforeSave', (character, options) => {
      return character.getCampaign()
      .then((campaign)=>{
        console.log('NPC?', campaign.OwnerId == character.UserId)
        if(campaign.OwnerId == character.UserId) character.npc = true
        return Promise.resolve(character);
      })

    })

  return Character;
};
