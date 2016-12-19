module.exports = (req,res,next) => {
  // if there is no user or main character, remove them from the session
  if(!req.user || !req.user.MainCharId) {
    return next();
  }

  return req.user.getMainChar({include:[{model:db.Campaign}]})
  .then(character => {
    res.locals.currentUser.activeChar = character
    res.locals.activeSystem = SYSTEM[character.Campaign.system]

    return next();
  })

}
