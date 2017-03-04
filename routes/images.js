'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');

// Images

router.get('/', (req,res,next) => {
  if(!res.locals.imageable) return next(Common.error.notfound('Could not locate the imageable resource'))
  return res.json(res.locals.imageable.Images)
  return next();
});

// uploads an image to the imageable resource
router.post('/', Common.middleware.requireUser, (req,res,next) => {
  if(!res.locals.imageable) return next(Common.error.notfound('Could not locate the imageable resource'));
  debugger;

  // TODO: image processing library

  // create a comment on this resource as the active character
  return res.locals.imageable.createImage({
    path: res.locals.imageable.$modelOptions.name.plural,
    file: req.file,
  })
  .then(image => {
    if(req.requestType('json')) return res.json(image.get({plain:true}))
    return res.redirect(req.headers.referer)
  })
  .catch(next)
});

let imageRouter = express.Router({mergeParams: true})

router.use('/:s3key', (req,res,next) => {

  return db.Image.findOne({
    where: {key: req.params.key}
  })
  .then(image => {
    res.locals.image = image
    return next();
  })
  .catch(next)

}, imageRouter);

// pipe from s3
imageRouter.get('/', (req,res,next) => {
  if(!res.locals.image) return next();

  let source = request({
    url: res.locals.image.url,
    headers: {
      'Cache-Control': 'public, max-age=3155760'
    }
  });

  res.removeHeader('Pragma')
  res.set('Expires', new Date(Date.now() + 31104000000).toUTCString())
  res.set('Cache-Control','public, max-age=3155760')

  source.pipe(res)

})

imageRouter.delete('/', (req,res,next) => {
  if(!res.locals.image) return next();

  return res.locals.image.destroy()
  .then(()=>{
    return res.sendStatus(200)
  })
  .catch(next)

})

module.exports = router
