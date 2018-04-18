const jwtInterface = require('../../jwt');

module.exports = jwtInterface.getUserFromJWT((root, args, {user}) => {

  /* ==============================
   * Campign Mutation:
   *    id: ID (if modifying)
   *    url: (String) custom url slug (if creating, must be unique)
   *    name: (String) the display name of the campaign
   *    system: (String) the linked game system; corresponds to a key in the core systems module
   *    privacy_level: (String)
   * ============================== */
  if(!user) throw new Error('You must be logged in to create/modify a campaign')

  // new campaign: if no ID is provided, create a new campaign giving the current user full permissions
  if(!('id' in args.campaign)) {
    return user.createCampaign(args.campaign)
    .then(campaign => {
      return user.addPermission(campaign, {owner: true, read:true, write:true})
      .then(() => campaign)
    })
  }

  // modify campaign

  return db.Campaign.findOne({where: {id: args.campaign.id}})
  .then(campaign => {
    return user.checkPermission(campaign, {write: true})
    .then(permission => {
      if(!permission) throw Common.error.authorization('You do not have permission to modify this campaign')
      return campaign.update(args.campaign)
    })
  })
})