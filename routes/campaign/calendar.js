'use strict';

var express = require('express');
var router = express.Router();

router.use((req, res, next) => {
  db._methods(res.locals.campaign, /calendar/i)

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


  return res.locals.campaign.Calendar.getEvents({sort:[['year',-1],['day','-1']]})
  .then(events => {
    let populatedCalendar = res.locals.campaign.Calendar.generateCalendar(events)
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

router.post('/present', Common.middleware.requireGM, Common.middleware.objectifyBody, (req, res, next) => {

  db._methods(res.locals.campaign.Calendar, /present/i)

  let dayOfYear = (res.locals.campaign.Calendar.months.slice(0,Number(req.body.month))
  .reduce((a,b)=>{return a+b.days},0) + req.body.date) % res.locals.campaign.Calendar.year_length

  return Promise.try(()=> {
    if(!res.locals.campaign.Calendar.present) return;
    return res.locals.campaign.Calendar.present.destroy();
  })
  .then(() => {
    return res.locals.campaign.Calendar.createPresent({
      name: "Present Date",
      timestamp: [res.locals.campaign.Calendar.convertToTimestamp({
        year: req.body.year,
        month: req.body.month,
        date: req.body.date,
        hour: req.body.hour,
        minute: req.body.minute,
        second: 0,
        milisecond: 0,
      }),null]
    })
  })
  .then(present => {
    if(req.json) return res.json(present)
    res.sendStatus(200)

  })
  .catch(next)
});

// add a new event to the calendar
router.post('/event', (req, res, next) => {
  return res.locals.campaign.Calendar.createEvent(req.body)
  .then(event => {
    if(req.json) return res.json(event)
  })
  .catch(next)
});

router.get('/event/:id', (req, res, next) => {

  return db.Event.findOne({where: {id: req.params.id}})
  .then(event => {
    if(!event) return next();
    if(req.json) return res.json(event)
  })
  .catch(next)

})


module.exports = router;
