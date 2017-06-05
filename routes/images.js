'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');
// Images

router.get('/', (req,res,next) => {
  if(!res.locals.imageable) return next(Common.error.notfound('Could not locate the imageable resource'));
  res.locals.breadcrumbs.push({name: "Images", url:req.baseUrl});
  return res.json(res.locals.imageable.Images)
  return next();
});

// uploads an image to the imageable resource
router.post('/', Common.middleware.requireUser, Common.middleware.bufferFile.array('files', CONFIG.aws.PER_RESOURCE_LIMIT), (req,res,next) => {
  // throw an error if there's no resource
  if(!res.locals.imageable) return next(Common.error.notfound('Could not locate the imageable resource'));
  // throw an error if the user does not own the resource
  if(!req.user.controls(res.locals.imageable).owner) return next(Common.error.notfound('You do not have permission to upload to this resource'));
  // throw an error if the operation would give the resource too many images
  if(res.locals.imageable.Images.length + req.files.length > CONFIG.aws.PER_RESOURCE_LIMIT) {
    return next(Common.error.request('You can only upload a maximum of ' + CONFIG.aws.PER_RESOURCE_LIMIT + ' images to this resource'))
  }
  // TODO: image processing library

  res.set('Content-Type','application/octet-stream');

  return Promise.map(req.files, (file,i) => {
    return res.locals.imageable.createImage({
      _directory: res.locals.imageable.$modelOptions.name.plural,
      _file: file
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

// changes the relative order of the user's images
router.post('/order', (req,res,next) => {
  // TODO: this
  return next();
})

let imageRouter = express.Router({mergeParams: true})

router.use('/:id', (req,res,next) => {
  if(!res.locals.imageable) return next(Common.error.notfound('Could not locate the imageable resource'));

  return res.locals.imageable.getImages({
    where: {id: req.params.id}
  })
  .then(image => {
    res.locals.image = image[0]
    return next();
  })
  .catch(next)

}, imageRouter);

// get an image in various forms of markup
imageRouter.get('/', (req,res,next) => {
  if(!res.locals.image) return next();
  if(req.modal) return res.render('images/modals/preview')
  return res.redirect(res.locals.image.path)
})

imageRouter.delete('/', Common.middleware.requireUser, Common.middleware.confirmDelete('remove'), (req,res,next) => {
  if(!res.locals.image) return next();
  if(!req.user.controls(res.locals.imageable).owner) return next(Common.error.notfound('You do not have permission to upload to this resource'));

  return res.locals.image.destroy()
  .then(()=>{
    return res.json({ref:res.locals.image, kind:"Image"})
  })
  .catch(next)

})

module.exports = router
