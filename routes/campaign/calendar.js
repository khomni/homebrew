'use strict';

var express = require('express');
var router = express.Router();

router.use((req,res,next) => {
  db._methods(res.locals.campaign, /calendar/i)

  return res.locals.campaign.getCalendar()
  .then(calendar => {
    res.locals.calendar = calendar

    return next();
  })
  .catch(next)
})

// campaign calendar and time settings
router.get('/', Common.middleware.requireUser, (req, res, next) => {
  if(!res.locals.campaign.Calendar) return res.redirect(req.baseUrl + '/edit');

  if(req.json) return res.json(res.locals.campaign.Calendar)
  return next();
});

router.get('/edit', Common.middleware.requireGM, (req, res, next) => {

  return res.render('campaign/calendar/edit')
});

// set the campaign calendar
router.post('/', Common.middleware.requireGM, Common.middleware.objectifyBody, (req, res, next) => {

  req.body.year_length = req.body.months.reduce((a,b)=>{
    return a + b.days
  },0)

  return Promise.try(() => { // delete any existing calendar, and all events
    if(!res.locals.campaign.Calendar) return res.locals.campaign.createCalendar(req.body)
    return res.locals.campaign.Calendar.update(req.body)
  })
  .then(newCalendar => {
    if(req.json) return res.send(newCalendar)
    return res.redirect(req.baseUrl);
  })
  .catch(next)

});

router.get('/present', (req, res, next) => {
  if(req.json) return res.json(res.locals.campaign.Calendar.getContext(res.locals.campaign.Calendar.present))
})

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
      year: [req.body.year],
      day: [dayOfYear],
      hour: [req.body.hour],
      minute: [req.body.minute],
    })
  })
  .then(present => {
    if(req.json) return res.json(present)
    res.sendStatus(200)

  })
  .catch(next)

});


module.exports = router;
