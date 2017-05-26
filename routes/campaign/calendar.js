'use strict';

var express = require('express');
var router = express.Router();

router.use((req, res, next) => {

  return res.locals.campaign.getCalendar()
  .then(calendar => {
    res.locals.calendar = calendar
    return next();
  })
  .catch(next);

})

// campaign calendar and time settings
router.get('/', Common.middleware.requireUser, (req, res, next) => {
  if(!res.locals.campaign.Calendar) return res.redirect(req.baseUrl + '/edit');
  db._methods(res.locals.campaign.Calendar,/event/i)

  let start, end
  let query = {}

  // for normal page navigation, assume that the user wants the CURRENT_YEAR
  if(!req.json) req.query.year = req.query.year || res.locals.campaign.Calendar.now.year
  res.locals.year = Number(req.query.year);
  // if a year is specified, get the timestamps for the start of this year and the start of the next to get all events in the year
  if(req.query.year) {
    start = res.locals.campaign.Calendar.convertToTimestamp({year:req.query.year})
    end  = res.locals.campaign.Calendar.convertToTimestamp({year:Number(req.query.year)+1})
    query.where = {timestamp: {$contained: [start,end]}}
  }

  // if a range is provided, generate a calendar that covers the entire range
  if(req.query.start && req.query.end) {
    start = res.locals.campaign.Calendar.convertToTimestamp({year:req.query.start})
    end = res.locals.campaign.Calendar.convertToTimestamp({year:Number(req.query.end)})
    query.where = {timestamp: {$contained: [start,end]}}
  }

  return res.locals.campaign.Calendar.getEvents(query)
  .then(events => {
    let populatedCalendar = res.locals.campaign.Calendar.generateCalendar(events,{year:req.query.year})
    if(req.json) return res.json({calendar: populatedCalendar})
    return res.render('campaign/calendar', {calendar: populatedCalendar})
  })
  .catch(next); 

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
  timestamp.push(timestamp[0])

  return Promise.try(()=> {
    if(!res.locals.campaign.Calendar.present) return;
    return res.locals.campaign.Calendar.present.destroy();
  })
  .then(() => {

    return res.locals.campaign.Calendar.createPresent({
      name: "Present Date",
      timestamp: [{ value: timestamp[0], inclusive: true}, {value: timestamp[1], inclusive: true}]
    })
  })
  .then(present => {
    if(req.json) return res.json(present)
    res.sendStatus(200)

  })
  .catch(next)
});

// add a new event to the calendar
router.post('/event', Common.middleware.objectifyBody, (req, res, next) => {

  let timestamp = res.locals.campaign.Calendar.convertToTimestamp(req.body.timestamp)

  return res.locals.campaign.Calendar.createEvent(Object.assign(req.body,{timestamp: [{value: timestamp[0], inclusive:true}, {value: timestamp[1], inclusive: true}]}))
  .then(event => {
    if(req.json) return res.json(event)
    return res.render('modals/_success', {title:'Event Posted', redirect:req.headers.referer})
  })
  .catch(next)
});

router.get('/:year-:month-:day', (req, res, next) => {

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
    let day = res.locals.campaign.Calendar.dateFromTimestamp(start)
    events.map(e => e.time = res.locals.campaign.Calendar.dateFromTimestamp(e))
    if(req.json) return res.json({year: day.year, month: day.month, date: day.date, weekday: day.weekday, events: events})
    if(req.modal) return res.render('campaign/calendar/_day', {events: events, day: day})
    return next();
  })
  .catch(next)
});

// update an event
router.post('/:id', Common.middleware.objectifyBody, (req, res, next) => {

  let timestamp = res.locals.campaign.Calendar.convertToTimestamp(req.body.timestamp)
  .map(v=> {return {value: v, inclusive: true}})
  
  return db.Event.find({where:{id:req.params.id}})
  .then(event => {
    return event.update({name: req.body.name, timestamp:timestamp})
  })
  .then(event => {
    if(req.json) return res.json({ref:res.locals.item, kind:'Item'})
    return res.render('modals/_success', {title:'Event Deleted', redirect:req.headers.referer})
  })
  .catch(next);
})

// delete an event
router.delete('/:id', (req, res, next) => {
  return db.Event.findOne({where:{id:req.params.id}})
  .then(event => {
    return event.destroy();
  })
  .then(event => {
    if(req.json) return res.json({ref:res.locals.item, kind:'Item'})
    return res.render('modals/_success', {title:'Event Deleted', redirect:req.headers.referer})
  })
  .catch(next)
})


module.exports = router;
