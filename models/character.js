"use strict";

const { ModelWrapper } = Common.models;

module.exports = ModelWrapper('Character', DataTypes => ({
  // optional URL field; defaults to the id route
  // should only be preceded by forward slashes
  url: {
    type: DataTypes.VIRTUAL,
    get: function(){
      return `/pc/${this.slug || this.id}`
    }
  },
  // character name is an array of strings
  // a character many have a name of any length
  race: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0,32]
    }
  },
  sex: {
    type: DataTypes.ENUM,
    allowNull: true,
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
  // this field should be manipulated by the inherited rules system
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
  }
}), {}, Character => {

  Character.associate = function(models) {
    // a character is part of a campaign, so it contains a reference to that campaign
    Character.belongsTo(models.Campaign, {constraints: false});

    Character.belongsTo(models.Event,{
      as: 'birthday', 
      constraints:false,
      scope: {
        eventable: 'birthday'
      }
    });

    /* Tentative: Character permissions? */
    Character.belongsToMany(models.User, {
      as: 'permission', 
      foreignKey: 'permission_id',
      through: {
        model: models.Permission,
        scope: {
          permissionType: 'Character'
        },
        constraints: false,
      },
      constraints: false,

    });

    // a character has lore in the form of their bio and backstory
    Character.hasMany(models.Lore, {
      as: 'lore',
      foreignKey: 'lorable_id',
      constraints: false,
      scope: {
        lorable: 'Character'
      },
    });

    Character.hasMany(models.Image, {
      // as: 'images',
      foreignKey: 'imageable_id',
      constraints: false,
      scope: {
        imageable: 'Character'
      },
    });

    Character.addScope('defaultScope', {
      // exclude hidden fields
      // attributes: {exclude: ['$name']},
      include: [
        {
          model: models.Campaign,
          attributes: ['id','slug','system','name']
        }, 
        // { model:models.Image, order:[['order','ASC']] }
      ]
    }, {override:true} )

    Character.addScope('session', {
      attributes: ['id','name','slug','title', 'CampaignId', 'location', 'ownerId'],
      include: [
        { model: models.Campaign.scope('session') }, 
        // { model: models.Image, order:[['order','ASC']] }
      ]
    }, {override:true} )

    // Character.belongsTo(models.Party);
    Character.belongsToMany(models.Character, {as: 'relationship', through: models.Relationship});
    // a character has access to some pieces of lore, the association being 'knowledge'
    Character.belongsToMany(models.Lore, {as: 'knowledge', through: models.Knowledge});
    // a character can be a member of one or more factions
    Character.belongsToMany(models.Faction, {as: 'membership',through: models.Membership});

    // items tend to belong to characters, so they can have an owner in their record
    Character.hasMany(models.Item);

    // a acharacter owns their journal entries
    Character.hasMany(models.Journal);
  
  }

  Character.relationships = charArray => {
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
  }

  Character.hook('beforeUpdate', (character, options) => {
    return character.getCampaign()
    .then((campaign) => {
      character.npc = campaign.ownerId === character.ownerId
      return Promise.resolve(character);
    })
  })
  
  /* ==============================
   * Instance Methods
   * ============================== */

  Character.Instance.prototype.getName = function(string) {
    switch (string) {
      case "first": return this.getDataValue('name')[0]
      case "formal": return `${this.title||''} ${this.name||''}`
      default: return this.name
    }
  }

  Character.Instance.prototype.ownedBy = function(user) {
    return user.id === this.ownerId 
  }

  // returns true if the input user has this character selected as their main
  Character.Instance.prototype.isActiveChar = function(user) {
    return user.MainCharId === this.id || user.MainChar.id === this.id
  }

  return Character;
})
