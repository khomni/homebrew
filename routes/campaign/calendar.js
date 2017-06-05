'use strict';

var express = require('express');
var router = express.Router();

router.use((req, res, next) => {

  res.locals.breadcrumbs.push({name: "Calendar", url:req.baseUrl});

  return res.locals.campaign.getCalendar()
  .then(calendar => {
    return next();
  })
  .catch(next);
})

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
    if(req.xhr) return res.set('X-Redirect', req.baseUrl).sendStatus(302)
    return res.redirect(req.baseUrl);
  })
  .catch(next)
});

// get the JSON
router.get('/present', (req, res, next) => {
  if(req.json) return res.json(res.locals.campaign.Calendar.now)
  return res.redirect(req.baseUrl);
})

//
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
router.post('/event', Common.middleware.requireCharacter, Common.middleware.objectifyBody, (req, res, next) => {

  let timestamp = res.locals.campaign.Calendar.convertToTimestamp(req.body.timestamp)

  return res.locals.campaign.Calendar.createEvent(Object.assign(req.body,{timestamp: timestamp, ownerId: req.user.id}))
  .then(event => {
    if(req.json) return res.json(event)
    return res.render('modals/_success', {title:'Event Posted', redirect:req.headers.referer})
  })
  .catch(next)
});

let eventRouter = express.Router({mergeParams: true})

router.use('/event/:id', (req, res, next) => {
  return db.Event.findOne({where:{id:req.params.id}})
  .then(event => {
    event.time = res.locals.campaign.Calendar.dateFromTimestamp(event);
    event.owned = req.user && (event.ownerId == req.user.id)
    return res.locals.event = event
  })
  .finally(next)
  .catch(next);

}, eventRouter)

eventRouter.get('/', (req,res,next) => {
  if(!res.locals.event) return next();
  Promise.try(()=>{
    res.locals.action = req.originalUrl
    return res.render('campaign/calendar/_event')
  })
  .catch(next)
})

eventRouter.post('/', Common.middleware.verifyOwner('event.owned'), Common.middleware.objectifyBody, (req, res, next) => {
  if(!res.locals.event) return next();
  let timestamp = res.locals.campaign.Calendar.convertToTimestamp(req.body.timestamp)

  Object.assign(res.locals.event, {name: req.body.name, timestamp: timestamp})

  return res.locals.event.save()
  .then(event => {
    if(req.json) return res.json({ref:res.locals.item, kind:'Item'});
    if(req.xhr) return res.set('X-Redirect', req.headers.referer).send();
    return res.redirect(req.headers.referer)
  })
  .catch(next)
})

eventRouter.delete('/', Common.middleware.verifyOwner('event.owned'), (req, res, next) => {
  if(!res.locals.event) return next();
  return res.locals.event.destroy()
  .then(event => {
    if(req.json) return res.json({ref:res.locals.item, kind:'Item'})
    if(req.xhr) return res.set('X-Redirect', req.headers.referer).send();
    return res.redirect(req.headers.referer)
  })
  .catch(next);

})

// the default calendar page, defaults to displaying the month around the present day, if possible
router.get('/:year?/:month?', (req,res,next) => {

  if(!res.locals.campaign.Calendar) return res.redirect(req.baseUrl + '/edit')

  let calendarRange
  let targetDate = res.locals.campaign.Calendar&&res.locals.campaign.Calendar.now || {year:1,monthIndex:0}
  res.locals.navigation = {}

  if(req.params.month || !req.params.year) {
    if(req.params.year) targetDate.year = Number(req.params.year)
    if(req.params.month) targetDate.monthIndex = Number(req.params.month)-1

    res.locals.navigation.previous = {
      anchor: req.baseUrl + '/' + [
        (targetDate.monthIndex) == 0 ? targetDate.year-1 : targetDate.year,
        Common.zeropad(targetDate.monthIndex == 0 ? res.locals.campaign.Calendar.months.length : ((targetDate.monthIndex-1) % res.locals.campaign.Calendar.months.length) + 1, 2)
      ].join('/'),
    }

    res.locals.navigation.next = {
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

    res.locals.navigation.previous = {
      name: Number(req.params.year) - 1,
      anchor: req.baseUrl + '/' + (Number(req.params.year) - 1)
    }

    res.locals.navigation.next = {
      name: Number(req.params.year) + 1,
      anchor: req.baseUrl + '/' + (Number(req.params.year) + 1)
    }

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

router.get('/:year/:month/:day/new', Common.middleware.requireCharacter, (req, res, next) => {
  res.locals.action = req.baseUrl +'/event'
  res.locals.event = {year: Number(req.params.year), monthIndex: Number(req.params.month)-1, date:Number(req.params.day)}
  if(req.modal) return res.render('campaign/calendar/_event')
})

module.exports = router;
