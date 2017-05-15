"use strict";

const MILISECOND_DAYS = 86400000

module.exports = function(sequelize, DataTypes) {
  var Calendar = sequelize.define("Calendar", {
    year_length: {
      type: DataTypes.VIRTUAL,
      get: function() {
        return this.months.reduce((a,b)=>{ return a + b.days },0)
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

    today: {
      type: DataTypes.VIRTUAL,
      get: function(){
        return this.dateFromTimestamp(this.present)
      }
    }

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

  // returns a timestamp given an object with keys describing the time
  Calendar.Instance.prototype.convertToTimestamp = function(obj) {
    let thisCalendar = this;

    let epochTime = 0;

    if('year' in obj) epochTime += Number(obj.year) * thisCalendar.year_length
    if('month' in obj) epochTime += thisCalendar.months.slice(0,Number(obj.month)).reduce((a,b)=>{
      return a + b.days
    }, 0)
    if('date' in obj) epochTime += Number(obj.date)||0
    epochTime *= 24 // hours
    if('hour' in obj) epochTime += Number(obj.hour)||0
    epochTime *= 60 // minutes
    if('minute' in obj) epochTime += Number(obj.minute)||0
    epochTime *= 60 // seconds
    if('seconds' in obj) epochTime += Number(obj.second)||0
    epochTime *= 1000
    if('miliseconds' in obj) epochTime += Number(obj.miliseconds)||0

    console.log(epochTime, obj)

    return epochTime;

  }

  Calendar.Instance.prototype.dateFromTimestamp = function(event) {
    let thisCalendar = this;
    if(!event) return {}
    let timestamp = event;
    if(typeof event == 'object') timestamp = Number(event.timestamp.slice(0,1).pop());
    if(typeof timestamp != 'number') return {};

    let dateObject = {timestamp: timestamp};
    let milisecondYears = MILISECOND_DAYS * thisCalendar.year_length
    dateObject.year = Math.floor(timestamp / milisecondYears)

    let miliseconds = Math.floor(timestamp % (milisecondYears * dateObject.year))
    for (let i=0; !('month' in dateObject)&&i<thisCalendar.months.length; i++) {
      if(miliseconds < thisCalendar.months[i].days * MILISECOND_DAYS) {
        dateObject.month = thisCalendar.months[i].name;
        dateObject.monthIndex = i;
      } else {
        miliseconds -= thisCalendar.months[i].days * MILISECOND_DAYS
      }
    }

    dateObject.weekday = thisCalendar.weekdays[Math.floor(timestamp / MILISECOND_DAYS) % thisCalendar.weekdays.length]
    dateObject.date = Math.floor(miliseconds / MILISECOND_DAYS);
    miliseconds -= MILISECOND_DAYS * dateObject.date;
    dateObject.hour = Math.floor(miliseconds / 3600000);
    miliseconds -= dateObject.hour * 3600000;
    dateObject.minute = Math.floor(miliseconds / 60000);
    miliseconds -= dateObject.minute * 60000;
    dateObject.second = Math.floor(miliseconds / 1000);
    miliseconds -= dateObject.second * 1000;
    dateObject.milisecond = miliseconds

    return dateObject;

  }

  return Calendar;
};
