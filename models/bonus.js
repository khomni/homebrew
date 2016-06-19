"use strict";

// +[bonus.value] [bonus.type] bonus to [bonus.property]

module.exports = function(sequelize, DataTypes) {
  var Bonus = sequelize.define("Bonus", {
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      unique: true,
      values: ['alchemical','armor','base attack','circumstance','competence','deflection','dodge','enhancement','inherent','insight','luck','morale','natural armor','profane','racial','resistance','sacred','shield','size','trait'],
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    property: { // the property being modified by the bonus
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    classMethods: {
      associate: function(models) {

      }
    }
  });

  return Bonus;
};
