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

router.use('/*', (req,res,next) => {
  let key = req.params[0]

  return db.Image.findOne({key:key})
  .then(image => {
    console.log(image.get({plain:true}))

    let stream = s3.getObject({
      Key: image.s3.key,
      Bucket: image.s3.bucket,
    }).createReadStream()

    stream.on('close', response => {
      console.log('close:', response)
    });

    stream.on('error', err => {
      console.error(err.stack)
      throw err
    });

    res.removeHeader('Pragma')
    res.set('Expires',new Date(Date.now() + 31104000000).toUTCString())
    res.set('Cache-Control','public, max-age=3155760')
    stream.pipe(res)
  })
  .catch(next)

})

module.exports = router
