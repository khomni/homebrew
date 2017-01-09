"use strict";

module.exports = function(sequelize, DataTypes) {
  var Character = sequelize.define("Character", {
    // optional URL field; defaults to the id route
    // should only be preceded by forward slashes
    url: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: [0,32]
      },
      get: function() {
        return 'pc/' + (this.getDataValue('url') || this.id) + "/"
      }
    },
    // character name is an array of strings
    // a character many have a name of any length
    name: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      get: function() {
        var nameArray = this.getDataValue('name') || []
        return nameArray.join(' ')
      },
      set: function(val) {
        this.setDataValue('name',val.split(' '))
      },
      allowNull: false,
    },
    race: {
      type: DataTypes.STRING,
      allowNull:true,
      validate: {
        len: [0,32]
      }
    },
    sex: {
      type: DataTypes.ENUM,
      allowNull:true,
      values: ['male','female']
    },
    title: {
      type: DataTypes.STRING,
      allowNull:true,
      validate: {
        len: [0,64]
      }
    },
    npc: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    location: {
      type: DataTypes.GEOGRAPHY,
      defaultValue: { type: 'Point', coordinates: [0,0]}
    },

    // an arbitrary JSON object describing the mechanical attributes of a character
    // this field should be manipulated by the relevant system
    properties: {
      type: DataTypes.JSONB,
    },

    // Virtual Attributes
    // set active to true if a character matches a user's MainChar
    active: {
      type: DataTypes.VIRTUAL,
    },
    owned: {
      type: DataTypes.VIRTUAL
    },

  }, {
    classMethods: {
      relationships: (charArray) => {
        return Promise.map(charArray, char => {
          return char.getRelationship({where: {id: {$in:charArray.map(c=>{return c.id})}}})
          .then(relationships => {
            var keyed = {}
            relationships.reduce((a,b)=>{
              keyed[b.id]= b.Relationship
            },false)
            char.Relationships = keyed
            return char
          })
        })
      },
      associate: function(models) {
        // a character is part of a campaign, so it contains a reference to that campaign
        Character.belongsTo(models.Campaign, {constraints: false});

        // a character is a locable thing, so it has a location record
        // Character.hasOne(models.Location, {
        //   foreignKey: 'locatable_id',
        //   scope: {
        //     locatable: 'Character'
        //   }
        // });

        // a character has lore in the form of their bio and backstory
        Character.hasMany(models.Lore, {
          as: 'lore',
          foreignKey: 'lorable_id',
          scope: {
            lorable: 'Character'
          }
        });

        // Character.belongsTo(models.Party);
        Character.belongsToMany(models.Character, {as: 'relationship',through: models.Relationship});
        // a character has access to some pieces of lore, the association being 'knowledge'
        Character.belongsToMany(models.Lore, {as: 'knowledge', through: models.Knowledge});
        // a character can be a member of one or more factions

        // items tend to belong to characters, so they can have an owner in their record
        Character.hasMany(models.Item);

        // a acharacter owns their journal entries
        Character.hasMany(models.Journal);

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

  // Character.Instance.prototype.get = Common.utilities.get.bind(Character.Instance.prototype)

  Character.Instance.prototype.getName = function(string) {
    switch (string) {
      case "first": return this.getDataValue('name')[0]
      case "formal": return this.title + " " + this.name
      default: return this.name
    }
  }

  // returns true if the input user owns the character instance
  Character.Instance.prototype.ownedBy = function(user) {
    return user.id === this.UserId
  }

  // returns true if the input user has this character selected as their main
  Character.Instance.prototype.isActiveChar = function(user) {
    return user.MainCharId === this.id
  }

  return Character;
};
