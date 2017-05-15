"use strict";

module.exports = function(sequelize, DataTypes) {
  var Event = sequelize.define("Event", {
    name: { 
      // name used to quickly identify the event on calendars
      // e.g.
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,128]
      }
    },

    timestamp: {
      type: DataTypes.RANGE,
      index: true,
    },

    year: { 
      // events that don't have a year are considered to occur every year
      // the year can be an array of 1 or 2 years, if it is an array of 2 years, it covers the span of those years
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },

    day: {
      // events without a day assume a year-long event or a range of years
      // the day can be an array of 1 or 2 days; if it is an array of 2 days, it covers the span between those days
      // Relies on the related Calendar settings to get the name of the month and weekday
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
    },

    hour: { 
      // events use the 24 hour system, starting from 0
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      validate: {
        min: 0,
        max: 23,
      }
    },
    minute: {
      // optional:
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      allowNull: true,
      validate: {
        min: 0,
        max: 59,
      }
    }

    // an optional JSONB field for describing your campaign world's proprietary time system,
    // TODO: for more details on valid JSON formats, read accompanying documentation
  }, {
    scopes: {
      defaultScope: {
        sort: [['year',-1],['day',-1],['hour',-1],['minute',-1]]
      },
      present: {
        attributes: {exclude: 'Calendar'}
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['timestamp']
      },
    ],
    classMethods: {
      associate: function(models) {
        Event.belongsTo(models.Calendar);

        Event.hasMany(models.Lore,{
          as: 'lore',
          foreignKey: 'lorable_id',
          onDelete: 'cascade',
          scope: {
            lorable: 'Event'
          },
        });

        // change the default event scope to include the owning calendar
        // this ensures that events can use the owning calendar to provide month and weekday names
        Event.addScope('isolated', {
          include: [{model: models.Calendar, scope:'bare'}]
        }, {override:true} )
      }
    }
  });

  return Event;
};
