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

    // the human-readable time based on the owning calendar
    // TODO: figure out of its feasible to include the owning calendar by default so this can be populated automatically
    time : { 
      type: DataTypes.VIRTUAL
    }
    // an optional JSONB field for describing your campaign world's proprietary time system,
    // TODO: for more details on valid JSON formats, read accompanying documentation
  }, {
    scopes: {
      defaultScope: {
        sort: ['timestamp',1]
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
          scope: {
            lorable: 'Event'
          }
        });

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
