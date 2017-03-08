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
router.post('/', Common.middleware.requireUser, Common.middleware.bufferFile.array('files'), (req,res,next) => {
  if(!res.locals.imageable) return next(Common.error.notfound('Could not locate the imageable resource'));

  debugger;
  // TODO: image processing library

  res.set('Content-Type','application/octet-stream');

  return Promise.map(req.files, file => {
    return res.locals.imageable.createImage({
      _directory: res.locals.imageable.$modelOptions.name.plural,
      _file: file,
    })
    .then(image => {
      res.write(image.path)
      return image.get({plain:true})
    })
  })
  .then(uploads => {
    res.end()
  })
  .catch(next)
});

let imageRouter = express.Router({mergeParams: true})

router.use('/:id', (req,res,next) => {
  return db.Image.findOne({
    where: {id: req.params.id}
  })
  .then(image => {
    res.locals.image = image
    return next();
  })
  .catch(next)

}, imageRouter);

// get an image in various forms of markup
imageRouter.get('/', (req,res,next) => {
  if(!res.locals.image) return next();

  if(req.requestType('modal')) return res.render('images/modals/preview')
  return res.redirect(res.locals.image.path)

})

imageRouter.delete('/', Common.middleware.confirmDelete('remove'), (req,res,next) => {
  if(!res.locals.image) return next();

  return res.locals.image.destroy()
  .then(()=>{
    return res.json({ref:res.locals.image, kind:"Image"})
  })
  .catch(next)

})

module.exports = router
