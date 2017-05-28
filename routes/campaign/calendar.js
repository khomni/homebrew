'use strict';

var express = require('express');
var router = express.Router();

router.use((req, res, next) => {

  return res.locals.campaign.getCalendar()
  .then(calendar => {
    return next();
  })
  .catch(next);
})

// the default calendar page, defaults to displaying the month around the present day, if possible
router.get('/:year?/:month?', (req,res,next) => {
  let calendarRange
  let targetDate = res.locals.campaign.Calendar.now
  res.locals.navigation = {}

  if(req.params.month || !req.params.year) {
    if(req.params.year) targetDate.year = Number(req.params.year)
    if(req.params.month) targetDate.monthIndex = Number(req.params.month)-1

    res.locals.navigation.previous = {
      name: "Previous",
      anchor: req.baseUrl + '/' + [
        (targetDate.monthIndex) == 0 ? targetDate.year-1 : targetDate.year,
        Common.zeropad(targetDate.monthIndex == 0 ? res.locals.campaign.Calendar.months.length : ((targetDate.monthIndex-1) % res.locals.campaign.Calendar.months.length) + 1, 2)
      ].join('/'),
    }

    res.locals.navigation.next = {
      name: "Next",
      anchor: req.baseUrl + '/' + [
        (targetDate.monthIndex+1) == res.locals.campaign.Calendar.months.length ? targetDate.year+1 : targetDate.year,
        Common.zeropad(targetDate.monthIndex+1 == res.locals.campaign.Calendar.months.length ? 1 : ((targetDate.monthIndex+1) % res.locals.campaign.Calendar.months.length) + 1, 2)
      ].join('/'),
    }

  } else {

    calendarRange = [
      {year: Number(req.params.year)},
      {year: Number(req.params.year)+1, milisecond:-1},
    ]

  }

  calendarRange = calendarRange ||[
    { 
      year: targetDate.year, 
      month: targetDate.monthIndex+1 },
    { 
      year: targetDate.year, 
      month: targetDate.monthIndex+1, 
      date: res.locals.campaign.Calendar.months[targetDate.monthIndex].days,
      hour: 24, milisecond: -1
    }
  ]

  // console.log(res.locals.campaign.Calendar.now)
  return res.locals.campaign.Calendar.constructCalendar(calendarRange, {truncate: false})
  .then(calendar => {
    if(req.json) return res.json(calendar)
    return res.render('campaign/calendar', {calendar:calendar})
  })
  .catch(next);
})

// campaign calendar and time settings
router.get('/', Common.middleware.requireUser, (req, res, next) => {
  if(!res.locals.campaign.Calendar) return res.redirect(req.baseUrl + '/edit');

  let start, end
  let query = {}

  // for normal page navigation, assume that the user wants the CURRENT_YEAR
  if(!req.json) req.query.year = req.query.year || Common.utilities.get(res.locals.campaign.Calendar, 'now.year') || 1
  res.locals.year = Number(req.query.year);

  // if a year is specified, get the timestamps for the start of this year and the start of the next to get all events in the year
  if(req.query.year) {
    start = res.locals.campaign.Calendar.convertToTimestamp({year:req.query.year})
    end = start + (db.Calendar.MILISECOND_DAYS * res.locals.campaign.Calendar.year_length)
    query.where = {timestamp: {$contained: [start,end]}}
  }

  // if a range is provided, generate a calendar that covers the entire range
  if(req.query.start && req.query.end) {
    start = res.locals.campaign.Calendar.convertToTimestamp({year:req.query.start})
    end = res.locals.campaign.Calendar.convertToTimestamp({year:Number(req.query.end)})
    query.where = {timestamp: {$contained: [start,end]}}
  }

  if(end > db.Calendar.BIGINT_MAX) return next(Common.error.request("Calendars can't support timestamps over " + db.Calendar.BIGINT_MAX))

  return res.locals.campaign.Calendar.constructCalendar([start,end],{truncate: false})
  .then(calendar => {
    if(req.json) return res.json(calendar)
    return res.render('campaign/calendar', {calendar:calendar})
  })

});

router.get('/edit', Common.middleware.requireGM, (req, res, next) => {
  return res.render('campaign/calendar/edit')
});

// set the campaign calendar
router.post('/', Common.middleware.requireGM, Common.middleware.objectifyBody, (req, res, next) => {

  return Promise.try(() => { // delete any existing calendar, and all events
    if(!res.locals.campaign.Calendar) return res.locals.campaign.createCalendar(req.body)
    return res.locals.campaign.Calendar.update(req.body)
  })
  .then(newCalendar => {
    if(req.json) return res.json(newCalendar)
    return res.redirect(req.baseUrl);
  })
  .catch(next)

});

// router.get('/present', (req, res, next) => {
//   if(req.json) return res.json(res.locals.campaign.Calendar.getContext(res.locals.campaign.Calendar.present))
// })
router.get('/present', (req, res, next) => {
  if(req.json) return res.json(res.locals.campaign.Calendar.now)
})

router.post('/present', Common.middleware.requireGM, Common.middleware.objectifyBody, (req, res, next) => {

  let timestamp = res.locals.campaign.Calendar.convertToTimestamp(req.body.timestamp)

  return Promise.try(()=> {
    if(!res.locals.campaign.Calendar.present) return;
    return res.locals.campaign.Calendar.present.destroy();
  })
  .then(() => {

    return res.locals.campaign.Calendar.createPresent({
      name: "Present Date",
      eventable: 'present',
      timestamp: timestamp,
      ownerId: req.user.id
    })
  })
  .then(present => {
    if(req.json) return res.json(present)
    if(req.xhr) res.set('X-Redirect', req.headers.referer).sendStatus(302);
    res.redirect(req.headers.referer);
  })
  .catch(next)
});

// add a new event to the calendar
router.post('/event', Common.middleware.requireUser, Common.middleware.objectifyBody, (req, res, next) => {

  let timestamp = res.locals.campaign.Calendar.convertToTimestamp(req.body.timestamp)

  return res.locals.campaign.Calendar.createEvent(Object.assign(req.body,{timestamp: timestamp, ownerId: req.user.id}))
  .then(event => {
    if(req.json) return res.json(event)
    return res.render('modals/_success', {title:'Event Posted', redirect:req.headers.referer})
  })
  .catch(next)
});

let dateRouter = express.Router({mergeParams: true})

router.use('/:year/:month/:day', (req, res, next) => {

  res.locals.start = res.locals.campaign.Calendar.convertToTimestamp({
    year: req.params.year,
    month: req.params.month,
    date: req.params.day
  });

  res.locals.end = res.locals.start + db.Calendar.MILISECOND_DAYS - 1

  return next()

}, dateRouter);

router.get('/:year/:month/:day', (req, res, next) => {

  // get timestamp range for the entire day
  let start = res.locals.campaign.Calendar.convertToTimestamp({
    year: req.params.year,
    month: req.params.month,
    date: req.params.day
  })

  // get the whole day to the last milisecond
  let end = start + db.Calendar.MILISECOND_DAYS - 1

  // choose between only showing events that occur entirely within the day and all events that are happening during this day
  let query = {where: {timestamp: {}}}
  if(req.query.all) query.where.timestamp = {$overlap: [start, end]}
  else query.where.timestamp = {$overlap: [start, end]}

  return db.Event.findAll(query)
  .then(events => {
    events = events.sort((a,b) => {return a.timestamp[0] - b.timestamp[0]})
    let day = res.locals.campaign.Calendar.dateFromTimestamp(start)
    events.map(e => e.time = res.locals.campaign.Calendar.dateFromTimestamp(e))
    if(req.json) return res.json({year: day.year, month: day.month, date: day.date, weekday: day.weekday, events: events})
    if(req.modal) return res.render('campaign/calendar/_day', {events: events, day: day})
    return next();
  })
  .catch(next)
});

router.get('/:year/:month/:day/new', (req, res, next) => {
  res.locals.action = req.baseUrl +'/event'
  res.locals.event = {year: Number(req.params.year), monthIndex: Number(req.params.month)-1, date:Number(req.params.day)}
  if(req.modal) return res.render('campaign/calendar/_event')
})

let eventRouter = express.Router({mergeParams: true})

router.use('/:id', (req, res, next) => {
  return db.Event.findOne({where:{id:req.params.id}})
  .then(event => {
    event.time = res.locals.campaign.Calendar.dateFromTimestamp(event);
    event.owned = event.ownerId == req.user.id
    return res.locals.event = event
  })
  .finally(next)
  .catch(next);

}, eventRouter)

eventRouter.get('/', (req,res,next) => {
  Promise.try(()=>{
    res.locals.action = req.originalUrl
    return res.render('campaign/calendar/_event')
  })
  .catch(next)
})

eventRouter.post('/', Common.middleware.verifyOwner('event.owned'), Common.middleware.objectifyBody, (req, res, next) => {

  let timestamp = res.locals.campaign.Calendar.convertToTimestamp(req.body.timestamp)

  return res.locals.event.update(Object.assign(res.locals.event, {name: req.body.name, timestamp: timestamp}))
  .then(event => {
    if(req.json) return res.json({ref:res.locals.item, kind:'Item'})
    // if(req.modal) return res.render('modals/_success', {title:'Event Updated', redirect:req.headers.referer})
    if(req.xhr) return res.set('X-Redirect', req.headers.referer).send();
    return res.redirect(req.headers.referer)
  })
  .catch(next)
})

eventRouter.delete('/', Common.middleware.verifyOwner('event.owned'), (req, res, next) => {

  return res.locals.event.destroy()
  .then(event => {
    if(req.json) return res.json({ref:res.locals.item, kind:'Item'})
    if(req.xhr) return res.set('X-Redirect', req.headers.referer).send();
    return res.redirect(req.headers.referer)
  })
  .catch(next);

})

module.exports = router;
