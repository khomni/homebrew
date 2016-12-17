module.exports = {
  // restrict the following routes to logged-in users
  requireUser: (req,res,next) => {
    if(!req.user) return next(Common.error.authorization('You must be logged in to do that'))
    return next();
  },

  confirmDelete: (req,res,next) => {
    if(req.body.confirm) return next();
    res.locals.action = req.originalUrl
    res.locals.body = req.body
    return res.render('modals/confirmDelete')
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
    if(!req.user.activeChar) return next(Common.error.authorization("You need an active character to access this"))
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

    if(res.locals.campaign.OwnerId === req.user.id) return next();
    return next(Common.error.authorization("You must be logged in as the GM to access this resource"))
  }


}
