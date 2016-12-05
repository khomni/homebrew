module.exports = {
  // restrict the following routes to logged-in users
  requireUser: (req,res,next) => {
    if(!req.user) return next(Common.error.authorization('You must be logged in to do that'))
    return next();
  },

  // restrict the following routes to users who have permission to affect characters
  // Owners can access their own characters
  // GMs can access characters that are part of their campaign
  // Admins can access any characters
  requireCharacter: (req,res,next) => {
    if(!req.character) return next(); // fallback for if this middleware gets called when no character is attached to the request object
    if(!req.user) return next(Common.error.authorization("You must be logged in to access this resource"));
    if(req.user.admin) return next(); // admins get privilege regardless

    return req.user.hasCharacter(req.character)
    .then(owned => {
      if(owned) throw null // if the user owns the character, continue

      return req.character.getCampaign()
      .then(campaign => {
        if(!campaign) throw Common.error.authorization("You do not have permission to access this resource")
        return campaign.hasOwner(req.user)
      })
      .then(owned => {
        if(owned) throw null
        throw Common.error.authorization("You do not have permission to access this resource")
      })
    })
    .catch(next)
  },

  requireGM: (req,res,next) => {


    return next();
  }


}
