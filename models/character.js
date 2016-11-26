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
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1,32]
      }
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
      name: function(){
        return this.name.split(' ');
      }
    },
    setterMethods : {
      name: function(string) {
        this.setDataValue('name', string.split(' '))
      }
    },
    classMethods: {
      associate: function(models) {
        // a character is part of a campaign, so it contains a reference to that campaign
        Character.belongsTo(models.Campaign);
        // a user account has a designated main character
        Character.hasOne(models.User, {as: 'mainChar'});

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

  return Character;
};
