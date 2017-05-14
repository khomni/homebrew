"use strict";

module.exports = function(sequelize, DataTypes) {
  var Calendar = sequelize.define("Calendar", {
    year_length: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 360,
      validate: {
        min: 1
      }
    },

    weekdays: { 
      // array of weekdays, cycling constant
      // based on calendar start
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },

    months: {
      // object of months, dependent on day of year
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: false,
      validate: function(monthObj) {
        // month.name:
        // month.days:
      }
    },

    /*
    moons: {
      // object of months, dependent on day of year
      type: DataTypes.ARRAY(DataTypes.JSONB),
      allowNull: false,
      validate: function(monthObj) {
        // moons.cycle
        // moons.offset
      }
    },
    */

    // an optional JSONB field for describing your campaign world's proprietary time system,
    // TODO: for more details on valid JSON formats, read accompanying documentation
  }, {
    classMethods: {
      associate: function(models) {
        Calendar.hasMany(models.Event,{onDelete:'cascade'});

        // GM can mark a calendar's 'current' day using the event model
        Calendar.hasOne(models.Event, {
          as: 'present',
          onDelete: 'cascade'
        });

        Calendar.addScope('defaultScope', {
          include: [{model: models.Event, as: 'present', scope:'present'}]
        }, {override:true} )
      }
    }
  });

  // determines the 
  Calendar.Instance.prototype.getContext = function(event) {
    let thisCalendar = this;

    let date = event.day.slice(0,1).pop();
    let hour = event.hour.slice(0,1).pop();
    let minute = event.hour.slice(0,1).pop()

    // get the month by using the event's day
    let month = thisCalendar.months.reduce((a,b) => {
      if(isNaN(a)) return a
      if(a+b.days >= event.day.slice(0,1).pop()) return b
      date -= b.days
      a += b.days
      return a
    },0)

    // handle event ranges
    let epochDays = (event.year * thisCalendar.year_length) + event.day.slice(0,1).pop();
    let epochTimestamp = (epochDays * 86400) + (hour * 3600) + (minute * 60) * 1000

    // get the day of the week by using the start of the calendar
    let weekday = thisCalendar.weekdays[epochDays % thisCalendar.weekdays.length]

    return {
      year: event.year.slice(0,1).pop(),
      month: month.name,
      date: date,
      weekday: weekday,
      hour: minute,
      minute: minute,
      epochDays: epochDays,
      epochTimestamp: epochTimestamp,
    }
  }

  // get absolute event information by providing a date
  // converts a year, month name 
  Calendar.Instance.prototype.convertToTimestamp = function(obj) {

  }

  Calendar.Instance.prototype.getFromTimestamp = function(event) {

  }

  return Calendar;
};
