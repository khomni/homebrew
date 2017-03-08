'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  bucket: CONFIG.aws.bucket,
  region: CONFIG.aws.region,
});

router.get('/*', (req,res,next) => {
  let key = req.params[0]

  return db.Image.findOne({where: {key: key}})
  .then(image => {

    let stream = s3.getObject({
      Key: image.s3.key,
      Bucket: image.s3.bucket,
    }).createReadStream()

    res.removeHeader('Pragma')
    res.set('Expires',new Date(Date.now() + 31104000000).toUTCString())
    res.set('Cache-Control','public, max-age=3155760')
    stream.pipe(res)
  })
  .catch(next)
})

router.delete('/*', (req,res,next) => {
  let key = req.params[0]

  return db.Image.findOne({where: {key: key}})
  .then(image => {
    if(!image) return next()

    return image.destroy()
    .then(result =>{
      res.json({ref:image, kind: "Image"})
    })
  })
  .catch(next)
})

module.exports = router
