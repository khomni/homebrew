module.exports = (req,res,next) => {
  var campaign = req.user.get('MainChar.Campaign')

  if(campaign) {
    // if the user owns the campaign, flag the owned virtual to true for the purposes of GM controls
    if(req.user.id == campaign.UserId) campaign.owned = true
    res.locals.campaign = campaign
    res.locals.activeSystem = SYSTEM[campaign.system]
  }
  
  return next()

}
