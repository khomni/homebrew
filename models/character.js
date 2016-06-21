"use strict";

module.exports = function(sequelize, DataTypes) {
  var Character = sequelize.define("Character", {
    // identifier: {
    //   type: DataTypes.STRING,
    //   primaryKey: true
    // },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,32]
      }
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
  }, {
    getterMethods: {
      name: function(){
        return this.first_name + ' ' + this.last_name
      }
    },
    classMethods: {
      associate: function(models) {
        Character.belongsTo(models.Campaign);
        // Character.belongsTo(models.Party);
        Character.belongsToMany(models.Character, {as: 'relationship',through: models.Relationship})
        Character.hasMany(models.Item);
        Character.hasOne(models.Race);

      }
    }
  });

  return Character;
};
