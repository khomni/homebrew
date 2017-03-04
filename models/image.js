"use strict";

const AWS = require('aws-sdk');
const crypto = require('crypto');
const path = require('path')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
  bucket: CONFIG.aws.bucket,
  region: CONFIG.aws.region,
})

Promise.promisifyAll(s3)

module.exports = function(sequelize, DataTypes) {
  var Image = sequelize.define("Image", {
    url: { // complete link to
      type: DataTypes.VIRTUAL,
      get: function() {
        return 'https://' + this.s3.region + '.amazonaws.com/' + this.s3.bucket + '/' + this.s3.key
      }
    },
    imageable: { // the model type of the image
      type: DataTypes.STRING,
    },

    key: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
      unique: true,
    },
    // amazon s3 components
    s3: {
      type: DataTypes.JSONB,
      validate: function(object){
        if(!('region' in object)) throw new Error('Missing s3 region');
        if(!('bucket' in object)) throw new Error('Missing s3 bucket');
        if(!('key' in object)) throw new Error('Missing s3 key');
      }
    },
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    vetted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attribution: {
      type: DataTypes.STRING,
    },

    // these virtuals are used for the creation process only
    file: {type: DataTypes.VIRTUAL},
    path: {type: DataTypes.VIRTUAL},
  }, {
    classMethods: {
      associate: function(models) {

      },
    }
  });

  Image.beforeValidate((image, options) => {
    if(!image.file) throw new Error('No file provided')
    let filename = crypto.pseudoRandomBytes(16).toString('hex') + Date.now() + path.extname(image.file.originalname);

    let key = [];
    key.push(CONFIG.aws.directory);
    key.push(image.path);
    key.push(filename);

    image.key = key.join('/')

    image.s3 = {
      region: CONFIG.aws.region,
      bucket: CONFIG.aws.bucket,
      key: image.key,
    }

    return image
  })

  Image.beforeCreate((image, options) => {
    // TODO: upload the photo to s3
    // the file object will be included in the `file` field as a virtual object

    let startTime = Date.now();
    return s3.putObjectAsync({
      Bucket: CONFIG.aws.bucket,
      Key: image.s3.key,
      ContentType: image.file.mimetype,
      Body: image.file.buffer,
    })
    .then(response =>{
      s3Log('photo uploaded:', image.s3.key, '('+(Date.now()-startTime)+'ms)')
      return image
    })
  });

  Image.beforeDestroy((image, options) => {
    // TODO: amazon aws remove object
    let startTime = Date.now();
    return s3.deleteObjectAsync({
      Bucket: image.s3.bucket,
      Key: image.s3.key
    })
    .then(response =>{
      s3Log('photo deleted:', image.s3.key, '('+(Date.now()-startTime)+'ms)')
      return image
    })
  })

  // on image bulk destruction, make sure
  Image.beforeBulkDestroy((whereClause) => {
    // TODO: amazon aws remove object
    return Image.findAll({select:['s3'], where: whereClause.where})
    .then(s3Values => {
      if(!s3Values || s3Values.length == 0) return whereClause;

      let startTime = Date.now();
      return s3.deleteObjectsAsync({
        Bucket: CONFIG.aws.bucket, // TODO: group by image.s3.bucket, in case images have different buckets
        Delete: {
          Objects: s3Values.map(s => {return {Key: s.s3.key}})
        }
      })
      .then(response =>{
        s3Log(s3Values.length, 'photos deleted ('+(Date.now()-startTime)+'ms)')
        return whereClause
      })
    })
  })

  return Image;
};

function s3Log() {
  let hasError = false
  let args = Array.prototype.slice.call(arguments).map(function(arg){
    if(!(typeof arg == 'error')) return arg;
    hasError = true
    return arg.message
  })
  args.unshift('[s3::'+CONFIG.aws.bucket+'/'+CONFIG.aws.directory+']')
  if(hasError) return console.error(colors.red.apply(null, args))
  if(CONFIG.aws.logs) return console.log(colors.magenta.apply(null, args))
}
