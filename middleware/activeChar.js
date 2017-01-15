module.exports = (req,res,next) => {
  // if there is no user or main character, remove them from the session
  if(!req.user || !req.user.MainCharId) {
    return next();
  }

  return req.user.getMainChar({include:[{model:db.Campaign}]})
  .then(character => {
    if(!character) return next();
    res.locals.currentUser.activeChar = character
    if(character.Campaign) {
      res.locals.campaign = character.Campaign
      res.locals.activeSystem = SYSTEM[character.Campaign.system]
      if(req.user.id == character.Campaign.UserId) character.Campaign.owned = true
    }
    return next()
  })
  .catch(next)

}
