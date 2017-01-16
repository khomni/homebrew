var utilities = require('./utilities');
var flat = require('flat');

module.exports = {
  // given a req.body with a number of dot-delimited field names, converts the req.body into the corresponding object
  objectifyBody: (req,res,next) => {
    console.log("1:",req.body)
    for(var key in req.body) {
      if(!req.body[key]) delete req.body[key]
      // if(!!Number(req.body[key])) req.body[key] = Number(req.body[key])
      if(!Array.isArray(req.body[key]) && /\.\$\./.test(key)) req.body[key] = [req.body[key]]
      if(Array.isArray(req.body[key])) {
        req.body[key].map((value,index) => {
          if(value) {
            // if(!!Number(value)) value = Number(value)
            req.body[key.replace('$',index)] = value
          }
        })
        delete req.body[key]
      }
    }
    // 
    for(var key in req.body) if(!!Number(req.body[key])) req.body[key] = Number(req.body[key])

    console.log("2:",req.body)
    req.body = flat.unflatten(req.body)
    console.log("3:",JSON.stringify(req.body,null,'  '))
    return next();
  },

  // restrict the following routes to logged-in users
  requireUser: (req,res,next) => {
    if(!req.user) return next(Common.error.authorization('You must be logged in to do that'))
    return next();
  },

  confirmDelete: (req,res,next) => {
    if(req.body.confirm) return next();
    res.locals.action = req.originalUrl
    res.locals.body = req.body
    return res.render('modals/confirmDelete',{
      action: req.originalUrl,
      body:req.body
    })
    // return res.redirect(req.headers.referer)
    return next();
  },

  // restrict the following routes to users who have an active character
  // Owners can access their own characters
  // GMs can access characters that are part of their campaign
  // Admins can access any characters
  requireCharacter: (req,res,next) => {
    if(!req.user) return next(Common.error.authorization("You must be logged in to access this resource"));
    if(req.user.admin) return next(); // admins get privilege regardless
    if(!req.user.MainChar) return next(Common.error.authorization("You need an active character to access this"))
    return next()
  },

  /*
  return req.user.hasCharacter(res.locals.character)
  .then(owned => {
    if(owned) throw null // if the user owns the character, continue

    // check to see what campaign the character belongs to
    return res.locals.character.getCampaign()
    .then(campaign => {
      if(!campaign) throw Common.error.authorization("You do not have permission to access this resource")
      if(campaign.OwnerId === req.user.id) throw null
      throw Common.error.authorization("You do not have permission to access this resource")
    })
  })
  .catch(next)
  */

  requireGM: (req,res,next) => {
    if(!res.locals.campaign) return next();
    if(!req.user) return next(Common.error.authorization("You must be logged in as the GM to access this resource"));
    if(req.user.admin) return next();
    if(res.locals.campaign.owned) return next();
    return next(Common.error.authorization("You must be logged in as the GM to access this resource"))
  }


}
