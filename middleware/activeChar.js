module.exports = (req,res,next) => {
  if(!req.user) return next()

  if(req.user.MainChar && req.user.MainChar.Campaign) {
    let campaign = req.user.MainChar.Campaign
    // if the user owns the campaign, flag the owned virtual to true for the purposes of GM controls
    if(req.user.id == campaign.ownerId) campaign.owned = true
    res.locals.campaign = campaign
    res.locals.activeSystem = SYSTEM[campaign.system]
  }

  return next()

}
