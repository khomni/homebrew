'use strict';

const utilities = require('./utilities');
const flat = require('flat');
const formidable = require('formidable');
const multer = require('multer');

module.exports = {
  // given a req.body with a number of dot-delimited field names, converts the req.body into the corresponding object
  objectifyBody: (req,res,next) => {
    // console.log("1:",req.body)

    for(var key in req.body) {
      if(!req.body[key]) delete req.body[key]
      // if(!!Number(req.body[key])) req.body[key] = Number(req.body[key])
      if(!Array.isArray(req.body[key]) && /\.\$\./.test(key)) req.body[key] = [req.body[key]]
      
      if(Array.isArray(req.body[key])) {
        req.body[key] = req.body[key].filter(i => {return i!=''})

        if(/\.\$/.test(key)) {
          req.body[key].map((value,index) => {
            if(value) req.body[key.replace('$',index)] = value
          })
          // delete the placeholder `$` key
          delete req.body[key]
        }
      }
    }
    //
    for(var key in req.body) if(!!Number(req.body[key])) req.body[key] = Number(req.body[key])

    // console.log("2:", req.body)
    req.body = flat.unflatten(req.body)
    // console.log("3:", JSON.stringify(req.body,null,'  '))
    return next();
  },

  bufferFile: multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 25000000
    },
    fileFilter: function(req,file,cb){
      if(/^image/.test(file.mimetype)) return cb(null, true)
      console.log('rejecting:', file.mimetype)
      return cb(null, false)
    }
  }),

  parseMultipart: (req,res,next) => {
    let form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
      req.body = fields
      req.files = files
      return next()
    })

  },

  // restrict the following routes to logged-in users
  requireUser: (req,res,next) => {
    if(!req.user) return next(Common.error.authorization('You must be logged in to do that'))
    return next();
  },

  confirmDelete: (reaction) => {
    return (req,res,next) => {
      let route = req.baseUrl.replace(/[^a-zA-Z]+/gi,'/')
      req.session.confirmedDeletes = req.session.confirmedDeletes || {}
      if(req.body.confirm || req.session.confirmedDeletes[route]) {
        if(req.body.disable) req.session.confirmedDeletes[route] = true;
        return next();
      }
      res.locals.action = req.originalUrl;
      res.locals.body = req.body;
      return res.render('modals/confirmDelete',{
        action: req.originalUrl,
        body: req.body,
        reaction: reaction
      })
      // return res.redirect(req.headers.referer)
      return next();
    }
  },

  //
  requirePermission: (pathToInstance,query) => (req,res,next) => {
    if(!req.user) return next(Common.error.authorization('You must be logged in to access this resource'));
    let instance = Common.utilities.get(res.locals,pathToInstance)
    if(!instance) return next() // no instance by that name mounted

    return req.user.checkPermission(instance, query)
    .then(permission => {
      if(!permission) throw Common.error.authorization('You do not have permission to modify this resource');
      return next();
    })
    .catch(next)
  },

  // restrict the following routes to users who have an active character
  // Owners can access their own characters
  // Admins can access any characters
  requireCharacter: (req,res,next) => {
    // reject if the user is not signed in
    if(!req.user) return next(Common.error.authorization("You must be logged in to access this resource"));
    // allow if the user is an admin
    if(req.user.admin) return next(); // admins get privilege regardless
    // reject if the user doesn't have an active character
    if(!req.user.MainChar) return next(Common.error.authorization("You need an active character to access this"));

    if(res.locals.campaign && req.user.MainChar.CampaignId != res.locals.campaign.id) return next(Common.error.authorization("Your active character is not part of this campaign"))
    // contine if they do
    return next()
  },

  requireGM: (req,res,next) => {
    // allow if there is no campaign in the route
    if(!res.locals.campaign) return next();
    // reject if the user is not signed in
    if(!req.user) return next(Common.error.authorization("You must be logged in as the GM to access this resource"));
    // allow if the user is an admin
    if(req.user.admin) return next();
    // allow if the user owns the campaign
    if(res.locals.campaign.owned) return next();
    // otherwise, reject
    return next(Common.error.authorization("You must be logged in as the GM to access this resource"))
  },

  // 
  // a string pointing to a boolean in res.locals can be included to provide an alternative method of authorization
  verifyOwner: pathToBoolean => {

    return (req, res, next) => {
      if(res.locals.campaign && res.locals.campaign.owned) return next();
      if(!pathToBoolean) return next();
      if(!Common.utilities.get(res.locals, pathToBoolean)) throw Common.error.authorization("You do not have permission to access this resource")
    }
  }
}

module.exports.confirm = options => {
  options = options || {}

  return (req,res,next) => {

    let route = options.route || req.baseUrl.replace(/[^a-zA-Z_-]+/gi,'/')
    req.session.confirmations = req.session.confirmations || {}
    req.session.confirmations[route] = req.session.confirmations[route] || {}
    if(req.body.confirm || req.session.confirmations[route][req.method]) {
      if(req.body.disable) req.session.confirmations[route][req.method] = true; // ignore future warnings
      return next(); // proceed with the rest of the route
    }

    res.locals.action = req.originalUrl;
    res.locals.body = req.body;
    res.locals.method = req.method;

    return res.status(406).set('X-Modal',true).render('modals/confirm', {options})

  }
}

// given a req.body with a number of dot-delimited field names, converts the req.body into the corresponding object
module.exports.objectify = (req,res,next) => {
    // console.log("1:",req.body)
  try {
    // preserve the original body, just in case
    req._body = Object.assign({},req.body);

    for(let key in req._body) {
      
      //  any keys that are empty strings should be undefined so mongoose can unset fields
      if(req.body[key] == '') req.body[key] = undefined;
      if(!Array.isArray(req.body[key]) && /\.\$\./.test(key)) req.body[key] = [req.body[key]]

      if(Array.isArray(req.body[key])) {
        req.body[key] = req.body[key]

        if(/\.\$/.test(key)) {
          req.body[key].map((value,index) => {
            req.body[key.replace('$',index)] = value
          })

          // delete the placeholder `$` key
          delete req.body[key]
        }
      }
    }
    for(var key in req.body) if(!!Number(req.body[key])) req.body[key] = Number(req.body[key])
    req.body = flat.unflatten(req.body)
    return next();
  } catch(e) {
    return next(e);
  }
}

module.exports.querify = (req,res,next) => {

  // returns converted input (recursive)
  function convert(input) {
    if(/[,;]/gi.test(input)) {
      return input.split(/[,;]/gi).map(convert)
    }

    if(input.toLowerCase() === 'true') return true
    if(input.toLowerCase() === 'false') return false

    if(input==undefined || input=='') return undefined;
    if(!isNaN(Number(input))) return Number(input)
    return input
  }

  Object.keys(req.query).forEach(key => {
    let query = req.query[key]
    req.query[key] = convert(query)
  })

  return next();
}

// if the request is a static http request, render the default index page and load the content in dynamically
module.exports.statictab = (req,res,next) => {
  if(req.isTab || req.json || req.modal) return next();
  return res.render('index', {href: req.originalUrl})
}

module.exports.title = title => (req,res,next) => {
  res.locals.title = title ? `${title} – ${SITE_NAME}` : SITE_NAME;
  res.set('X-Page-Title', encodeURIComponent(res.locals.title));
  return next();
}
