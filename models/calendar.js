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

  Calendar.MILISECOND_DAYS = 86400000

  // given an array of events, returns a complete calendar data structure with the events populated
  Calendar.Instance.prototype.generateCalendar = function(events) {
    let thisCalendar = this;
    let years = []

    // sort events chronologically by start timestamp
    events = events.sort((a,b) => {
      return a.timestamp[0] - b.timestamp[0]
    }).map(e => {
      return thisCalendar.dateFromTimestamp(e);
    })

    let maxYear = events[events.length-1].year
    // establish the boundaries of the calendar so the interceding days can be filled in
    for(let i = Number(events[0].year); i<= maxYear ; i++) {
      let epochDay = (i-1) * thisCalendar.year_length // keep track of epochDay for weekdays
      years.push({
        year: i, 
        months: thisCalendar.months.map((m,k) => {
          let month = {name: m.name, weeks: []}
          let weekday = thisCalendar.weekdays[epochDay % thisCalendar.weekdays.length]
          let currentWeek = new Array(Math.max(thisCalendar.weekdays.indexOf(weekday),0))
          for(let j=1; j<=m.days;j++) {
            epochDay++;
            weekday = thisCalendar.weekdays[epochDay % thisCalendar.weekdays.length]
            let day = {date: j, weekday: weekday, events:[]}

            while(events[0] && events[0].year == i && events[0].monthIndex == k && events[0].date == j) {
              day.events.push(events.shift()) 
            }
            currentWeek.push(day)

            if(thisCalendar.weekdays.indexOf(weekday) == 0) {
              month.weeks.push(currentWeek)
              currentWeek = []
            }
          }
          if(currentWeek.length) month.weeks.push(currentWeek)
          return month
        })
      })
    }
    return years

  }

  // returns a timestamp given an object with keys describing the time
  Calendar.Instance.prototype.convertToTimestamp = function(obj) {
    let thisCalendar = this;

    let epochTime = 0;

    console.log(obj)

    if('year' in obj) epochTime += (Number(obj.year)-1) * thisCalendar.year_length
    if('month' in obj) epochTime += thisCalendar.months.slice(0,Math.max(Number(obj.month)-1,0)).reduce((a,b)=>{
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

    return epochTime;

  }

  Calendar.Instance.prototype.dateFromTimestamp = function(event) {
    let thisCalendar = this;
    if(!event) return {}
    let timestamp = event;
    if(typeof event == 'object') timestamp = Number(event.timestamp.slice(0,1).pop());
    if(typeof timestamp != 'number') return {};



    let dateObject = {id: event.id, name: event.name, timestamp: event.timestamp};
    let milisecondYears = MILISECOND_DAYS * thisCalendar.year_length
    dateObject.year = Math.floor(timestamp / milisecondYears)+1

    let miliseconds = Math.floor(timestamp % (milisecondYears * (dateObject.year-1)))
    for (let i=0; !('month' in dateObject)&&i<thisCalendar.months.length; i++) {
      if(miliseconds <= thisCalendar.months[i].days * MILISECOND_DAYS) {
        dateObject.month = thisCalendar.months[i].name;
        dateObject.monthIndex = i;
      } else {
        miliseconds -= thisCalendar.months[i].days * MILISECOND_DAYS
      }
    }

    dateObject.weekday = thisCalendar.weekdays[(Math.floor(timestamp / MILISECOND_DAYS)-1) % thisCalendar.weekdays.length]
    dateObject.date = Math.floor(miliseconds / MILISECOND_DAYS); //get the number of days
    console.log(dateObject.date,dateObject.weekday)
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
