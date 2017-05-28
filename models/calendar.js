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
        if(!this.present) null;
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
  Calendar.BIGINT_MAX = 9223372036854775807

  // takes an event query and constructs a calendar data structure that represents the event calendar
  // time: an object or an array of objects that describe the range of time to query. 
  // options: other
  // renders the entire month
  Calendar.Instance.prototype.constructCalendar = function(time, options) {
    options = options || {}
    let thisCalendar = this;
    // TODO: coerce the input times to make sure they lock to the start and end of each month

    if(!Array.isArray(time)) time = [time,time]
    let timestamps = time.map(t => thisCalendar.convertToTimestamp(t))

    // if options.trucate is set to false, render all the months for the time range, not just ones with events
    if(options.truncate == false) {
      options.startYear = thisCalendar.dateFromTimestamp(timestamps[0]).year
      options.startMonth = thisCalendar.dateFromTimestamp(timestamps[0]).monthIndex
      options.endYear = thisCalendar.dateFromTimestamp(timestamps[1]).year
      options.endMonth = thisCalendar.dateFromTimestamp(timestamps[1]).monthIndex
    }

    // key calendar by month and date to easily assign events
    let keyedCalendar = {}
    if(options.startYear) keyedCalendar[options.startYear] = {}
    if(options.endYear) keyedCalendar[options.endYear] = {}
    let arrayedCalendar = []

    if(!Array.isArray(timestamps)) timestamps = [timestamps]
    if(timestamps.length < 2) timestamps.push(timestamps[0])

    let query = {where: {timestamp: {$overlap: timestamps}}}
    if(options.where) Object.assign(query.where, options.where)

    // query all events that fall within the range
    return this.getEvents(query)
    .then(events => {

      // iterate through all events and add them to the object keyed by year-monthIndex-date
      events = events.map(e => {
        e.time = thisCalendar.dateFromTimestamp(e)
        let startTime = e.time[0]
        keyedCalendar[startTime.year] = keyedCalendar[startTime.year] || {}
        keyedCalendar[startTime.year][startTime.monthIndex] = keyedCalendar[startTime.year][startTime.monthIndex] || {}
        keyedCalendar[startTime.year][startTime.monthIndex][startTime.date] = keyedCalendar[startTime.year][startTime.monthIndex][startTime.date] || []
        keyedCalendar[startTime.year][startTime.monthIndex][startTime.date].push(e)
        return e
      })
      
      let yearRange = Object.keys(keyedCalendar).sort()
      let yearStart = yearRange[0]
      let yearEnd = yearRange.slice(-1).pop()

      // woooo, nested for loops
      for(let y = Number(yearStart); y <= Number(yearEnd); y++) {
        // get the total number of days since the start of the calendar to determine weekdays
        let epochDay = (y-1) * thisCalendar.year_length
        let year = {year: y, months: []}

        let monthRange = Object.keys(keyedCalendar[y]).sort()
        let monthStart = 'startMonth' in options ? options.startMonth : monthRange[0]
        let monthEnd = 'endMonth' in options ? options.endMonth : monthRange.slice(-1).pop()
        
        // truncate the months only for the first and last years
        let skippedDays = thisCalendar.months.slice(0,(monthStart)).reduce((a,b)=>{return a + b.days},0)
        epochDay += skippedDays
        // otherwise
        for(let m = (y == yearStart ? monthStart : 0); m <= (y == yearEnd ? monthEnd : (thisCalendar.months.length-1)) ; m++) {

          let month = {name: thisCalendar.months[m].name, weeks: [], monthIndex:m}
          let weekday = thisCalendar.weekdays[(epochDay-1) % thisCalendar.weekdays.length]
          let currentWeek = new Array(Math.max((thisCalendar.weekdays.indexOf(weekday)+1) % thisCalendar.weekdays.length, 0))

          for(let d=1; d<= thisCalendar.months[m].days; d++) {
            epochDay++;
            weekday = thisCalendar.weekdays[(epochDay-1) % thisCalendar.weekdays.length]
            let day = {date: d, weekday: weekday}
            keyedCalendar[y] = keyedCalendar[y] || {}
            keyedCalendar[y][m] = keyedCalendar[y][m] || {}
            keyedCalendar[y][m][d] = keyedCalendar[y][m][d] || []
            if(keyedCalendar[y][m][d]) day.events = keyedCalendar[y][m][d].sort((a,b)=>{return a.timestamp[0] - b.timestamp[0]})
            currentWeek.push(day)

            if(currentWeek.length == thisCalendar.weekdays.length) {
              month.weeks.push(currentWeek)
              currentWeek = []
            }
          }

          if(currentWeek.length) month.weeks.push(currentWeek.concat(new Array(thisCalendar.weekdays.length - currentWeek.length)))
          year.months.push(month)
        }

        arrayedCalendar.push(year)
      }

      return arrayedCalendar
    })
  }

  // TODO: Replace this with a more elegant way of constructing
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
    if('second' in obj) epochTime += Number(obj.second)||0
    epochTime *= 1000
    if('milisecond' in obj) epochTime += Number(obj.milisecond)||0

    return epochTime;

  }

  Calendar.Instance.prototype.dateFromTimestamp = function getDate(event) {
    let thisCalendar = this;
    if(!event && isNaN(event)) return {}
    var timestamp = event;
    if(typeof event == 'object') return event.timestamp.slice(0,2).map(getDate.bind(thisCalendar))

    let dateObject = {timestamp: Number(timestamp)};
    let milisecondYears = MILISECOND_DAYS * thisCalendar.year_length
    dateObject.year = Math.floor(timestamp / milisecondYears)+1

    let miliseconds = Math.floor(timestamp % milisecondYears)

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
    dateObject.slug = dateObject.year + '/' + Common.zeropad(dateObject.monthIndex+1,2) + '/' + Common.zeropad(dateObject.date,2)

    return dateObject;
  }
  
  return Calendar;
};
