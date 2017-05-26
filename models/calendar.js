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

    now: {
      type: DataTypes.VIRTUAL,
      get: function(){
        return this.dateFromTimestamp(this.present)[0]
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
  Calendar.Instance.prototype.generateCalendar = function(events, options) {
    options = options || {}
    let thisCalendar = this;
    let years = []

    // sort events chronologically by start timestamp
    events = events.sort((a,b) => {
      return a.timestamp[0] - b.timestamp[0]
    }).map(e => {
      e.time = thisCalendar.dateFromTimestamp(e)[0];
      return e;
    });

    let startYear = options.year || events[0] && events[0].year || undefined
    let endYear = options.year || events.length > 0 && events[events.length-1].year || undefined

    // establish the boundaries of the calendar so the interceding days can be filled in
    for(let i = startYear; i<= endYear ; i++) {
      let epochDay = (i-1) * thisCalendar.year_length // keep track of epochDay for weekdays
      years.push({
        year: i, 
        months: thisCalendar.months.map((m,k) => {
          let month = {name: m.name, weeks: []}
          let weekday = thisCalendar.weekdays[(epochDay-1) % thisCalendar.weekdays.length]
          let currentWeek = new Array(Math.max((thisCalendar.weekdays.indexOf(weekday)+1) % thisCalendar.weekdays.length ,0))
          for(let j=1; j<=m.days;j++) {
            epochDay++;
            weekday = thisCalendar.weekdays[(epochDay-1) % thisCalendar.weekdays.length]
            let day = {date: j, weekday: weekday, events:[]}

            while(events[0] && events[0].time && events[0].time.year == i && events[0].time.monthIndex == k && events[0].time.date == j) {
              day.events.push(events.shift()) 
            }
            currentWeek.push(day)

            if(currentWeek.length == thisCalendar.weekdays.length) {
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
  Calendar.Instance.prototype.convertToTimestamp = function getTimestamp(obj) {
    let thisCalendar = this;
    if(Array.isArray(obj)) return obj.map(getTimestamp.bind(thisCalendar))
    // TODO: figure out the best way to convert an input into
    let epochTime = 0;

    if('year' in obj) epochTime += (Number(obj.year)-1) * thisCalendar.year_length

    if('month' in obj) epochTime += thisCalendar.months.slice(0,Math.max(Number(obj.month)-1,0)).reduce((a,b)=>{
      return a + b.days
    }, 0)
    if('date' in obj) epochTime += Number(obj.date)-1||0
    epochTime *= 24 // hours
    if('hour' in obj) epochTime += Number(obj.hour)||0
    epochTime *= 60 // minutes
    if('minute' in obj) epochTime += Number(obj.minute)||0
    epochTime *= 60 // seconds
    if('seconds' in obj) epochTime += Number(obj.second)||0
    epochTime *= 1000
    if('miliseconds' in obj) epochTime += Number(obj.miliseconds)||0

    console.log('timestamp:', epochTime)

    return epochTime;

  }

  Calendar.Instance.prototype.dateFromTimestamp = function getDate(event) {
    let thisCalendar = this;
    let timestamp = event;
    if(typeof event == 'object') return event.timestamp.slice(0,2).map(getDate.bind(thisCalendar))

    let dateObject = {timestamp: Number(timestamp)};
    let milisecondYears = MILISECOND_DAYS * thisCalendar.year_length
    dateObject.year = Math.floor(timestamp / milisecondYears)+1

    let miliseconds = Math.floor(timestamp % milisecondYears)

    console.log('miliseconds:', miliseconds, 'year:', dateObject.year)

    for (let i=0; !('month' in dateObject)&&i<thisCalendar.months.length; i++) {
      if(miliseconds < thisCalendar.months[i].days * MILISECOND_DAYS) {
        dateObject.month = thisCalendar.months[i].name;
        dateObject.monthIndex = i;
      } else {
        miliseconds -= thisCalendar.months[i].days * MILISECOND_DAYS
      }
    }

    dateObject.weekday = thisCalendar.weekdays[(Math.floor(timestamp / MILISECOND_DAYS)) % thisCalendar.weekdays.length]

    dateObject.date = Math.floor(miliseconds / MILISECOND_DAYS)+1; //get the number of days
    miliseconds -= MILISECOND_DAYS * (dateObject.date-1);
    dateObject.hour = Math.floor(miliseconds / 3600000);
    miliseconds -= dateObject.hour * 3600000;
    dateObject.minute = Math.floor(miliseconds / 60000);
    miliseconds -= dateObject.minute * 60000;
    dateObject.second = Math.floor(miliseconds / 1000);
    miliseconds -= dateObject.second * 1000;
    dateObject.milisecond = miliseconds

    let readableTime = new Date()
    readableTime.setHours(dateObject.hour)
    readableTime.setMinutes(dateObject.minute)
    readableTime.setSeconds(dateObject.second)
    readableTime.setMilliseconds(dateObject.milisecond)
    dateObject.readableTime = readableTime.toLocaleTimeString()

    return dateObject;
  }
  
  return Calendar;
};
