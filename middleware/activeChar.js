module.exports = (req,res,next) => {
  // if there is no user or main character, remove them from the session
  if(!req.user || !req.user.MainCharId) {
    delete req.session.activeChar
    return next();
  }

  // if there's already a character in the session, reload it and continue using that
  if(req.session.activeChar && req.session.activeChar.id == req.user.MainCharId) {
    res.locals.activeChar = req.session.activeChar
    return next();
    // req.session.activeChar.reload(function(){
    //   res.locals.activeChar = req.session.activeChar
    //   return next()
    // })
  }

  db.Character.findOne({
    where: {id: req.user.MainCharId},
    include: [{model:db.Campaign}]
  }).then(pc =>{
    req.session.activeChar = pc
    res.locals.activeChar = req.session.activeChar
    next();
  }).catch(next)
}
